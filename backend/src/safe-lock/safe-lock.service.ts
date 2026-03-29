import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SafeLock } from './safe-lock.entity';
import { Inventory } from '../inventory/inventory.entity';
import { User } from '../users/user.entity';
import axios from 'axios';

const GO_SERVICE = process.env.GO_SERVICE_URL || 'http://go-service:8081';

@Injectable()
export class SafeLockService {
  private readonly logger = new Logger(SafeLockService.name);
  
  constructor(
    @InjectRepository(SafeLock) private safeLockRepo: Repository<SafeLock>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(User) private userRepo: Repository<User>,
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
    const inventory = await this.inventoryRepo.findOne({ where: { id: inventoryId } });
    if (!inventory) throw new NotFoundException('Inventory item not found');

    if (inventory.availableQuantity < quantity) {
      throw new BadRequestException('Not enough available quantity');
    }

    const safeLock = this.safeLockRepo.create({
      inventoryId,
      adminId,
      quantity,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      permanent,
    });
    
    await this.safeLockRepo.save(safeLock);

    // Also lock in Go service for consistency
    try {
      await axios.post(`${GO_SERVICE}/safe-lock`, {
        inventory_id: inventoryId,
        admin_id: adminId,
        quantity,
        expires_at: expiresAt,
        permanent,
      });
    } catch (e) {
      this.logger.error('Failed to sync with Go service during lock', e);
    }

    return safeLock;
  }

  async unlock(id: string) {
    const safeLock = await this.safeLockRepo.findOne({ where: { id } });
    if (!safeLock) throw new NotFoundException('Safe-lock not found');

    await this.safeLockRepo.delete(id);

    // Also unlock in Go service
    try {
      await axios.post(`${GO_SERVICE}/safe-lock/release`, {
        lock_id: id,
      });
    } catch (e) {
      this.logger.error('Failed to sync with Go service during unlock', e);
    }

    return { released: true };
  }
}
