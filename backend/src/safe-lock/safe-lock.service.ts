import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SafeLock } from './safe-lock.entity';
import { Inventory } from '../inventory/inventory.entity';
import { User } from '../users/user.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class SafeLockService {
  private readonly logger = new Logger(SafeLockService.name);
  
  constructor(
    @InjectRepository(SafeLock) private safeLockRepo: Repository<SafeLock>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 10, filters?: {
    expiry?: string;
    search?: string;
  }) {
    const query = this.safeLockRepo
      .createQueryBuilder('safeLock')
      .leftJoinAndSelect('safeLock.admin', 'admin');

    if (filters?.expiry && filters.expiry !== 'All') {
      if (filters.expiry === 'Expiring Soon') {
        query.andWhere('safeLock.expiresAt <= :date', { 
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        });
      } else if (filters.expiry === 'No Expiry') {
        query.andWhere('safeLock.permanent = :permanent', { permanent: true });
      }
    }

    const [data, total] = await query
      .orderBy('safeLock.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const formattedData = await Promise.all(
      data.map(async (item) => {
        const inventory = await this.inventoryRepo.findOne({ where: { id: item.inventoryId } });
        return {
          id: item.id,
          sku: `RES-${item.id.substring(0, 4).toUpperCase()}`,
          inventoryName: inventory?.name || 'Unknown',
          lockedQuantity: item.quantity,
          user: {
            name: item.admin?.username || 'Unknown',
          },
          expiry: item.permanent ? 'No Expiry' : item.expiresAt,
          isPermanent: item.permanent,
        };
      })
    );

    return { data: formattedData, total };
  }

  async getStats() {
    const totalLocked = await this.safeLockRepo
      .createQueryBuilder('safeLock')
      .select('SUM(safeLock.quantity)', 'totalLocked')
      .getRawOne();

    const expiringSoon = await this.safeLockRepo
      .createQueryBuilder('safeLock')
      .where('safeLock.expiresAt <= :date', { 
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
      })
      .andWhere('safeLock.permanent = :permanent', { permanent: false })
      .getCount();

    const safeLockedItems = await this.safeLockRepo.count();

    return {
      totalLocked: parseInt(totalLocked?.totalLocked || '0'),
      expiringSoon,
      safeLockedItems,
    };
  }

  async lock(inventoryId: string, quantity: number, adminId: string, expiresAt?: string, permanent = false) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.id = :id', { id: inventoryId })
        .getOne();

      if (!inventory) {
        throw new NotFoundException('Inventory item not found');
      }

      if (inventory.availableQuantity < quantity) {
        throw new BadRequestException('Not enough available quantity');
      }

      inventory.lockedQuantity += quantity;
      await queryRunner.manager.save(inventory);

      const safeLock = queryRunner.manager.create(SafeLock, {
        inventoryId,
        adminId,
        quantity,
        expiresAt: (!permanent && expiresAt) ? new Date(expiresAt) : null,
        permanent,
      });
      const savedLock = await queryRunner.manager.save(safeLock);

      await queryRunner.commitTransaction();

      this.eventsGateway.emitSafeLockUpdate();
      this.eventsGateway.emitInventoryUpdate();

      return {
        id: savedLock.id,
        inventoryId: savedLock.inventoryId,
        adminId: savedLock.adminId,
        quantity: savedLock.quantity,
        expiresAt: savedLock.expiresAt,
        permanent: savedLock.permanent,
        createdAt: savedLock.createdAt,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to safe-lock', err);
      throw err instanceof BadRequestException || err instanceof NotFoundException 
        ? err 
        : new BadRequestException('Failed to safe lock');
    } finally {
      await queryRunner.release();
    }
  }

  async unlock(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const safeLock = await queryRunner.manager
        .createQueryBuilder(SafeLock, 'lock')
        .setLock('pessimistic_write')
        .where('lock.id = :id', { id })
        .getOne();

      if (!safeLock) {
        throw new NotFoundException('Safe-lock not found');
      }

      const inventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.id = :id', { id: safeLock.inventoryId })
        .getOne();

      if (inventory) {
        inventory.lockedQuantity = Math.max(0, inventory.lockedQuantity - safeLock.quantity);
        await queryRunner.manager.save(inventory);
      }

      await queryRunner.manager.remove(safeLock);
      await queryRunner.commitTransaction();

      this.eventsGateway.emitSafeLockUpdate();
      this.eventsGateway.emitInventoryUpdate();

      return { released: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to release lock', err);
      throw err instanceof BadRequestException || err instanceof NotFoundException 
        ? err 
        : new BadRequestException('Failed to release lock');
    } finally {
      await queryRunner.release();
    }
  }
}

