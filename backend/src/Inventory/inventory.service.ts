import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private repo: Repository<Inventory>,
    private auditService: AuditService,
    private eventsGateway: EventsGateway,
  ) {}

  findAll(page = 1, limit = 50, search?: string) {
    const query = this.repo.createQueryBuilder('inventory');
    
    if (search) {
      query.where('inventory.name ILIKE :search OR inventory.sku ILIKE :search', { 
        search: `%${search}%` 
      });
    }
    
    return query
      .orderBy('inventory.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  getStats() {
    return this.repo
      .createQueryBuilder('inventory')
      .select('SUM(inventory.totalQuantity)', 'totalItems')
      .addSelect('SUM(inventory.availableQuantity)', 'availableItems')
      .addSelect('SUM(CASE WHEN inventory.reservedQuantity > 0 THEN 1 ELSE 0 END)', 'partiallyReserved')
      .getRawOne();
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async create(dto: CreateInventoryDto, userId?: string) {
    const item = this.repo.create({ ...dto, reservedQuantity: 0 });
    const saved = await this.repo.save(item);
    await this.auditService.log({
      userId,
      action: 'Item Added',
      entityType: 'inventory',
      entityId: saved.id,
      newValue: { sku: saved.sku, name: saved.name, totalQuantity: saved.totalQuantity },
    });
    this.eventsGateway.emitInventoryUpdate();
    return saved;
  }

  async update(id: string, dto: UpdateInventoryDto, userId?: string) {
    const before = await this.findOne(id);
    await this.repo.update(id, dto);
    const after = await this.findOne(id);
    await this.auditService.log({
      userId,
      action: 'Item Updated',
      entityType: 'inventory',
      entityId: id,
      oldValue: { name: before.name, totalQuantity: before.totalQuantity },
      newValue: { name: after.name, totalQuantity: after.totalQuantity },
    });
    this.eventsGateway.emitInventoryUpdate();
    return after;
  }

  async remove(id: string, userId?: string) {
    const item = await this.findOne(id);
    await this.auditService.log({
      userId,
      action: 'Item Deleted',
      entityType: 'inventory',
      entityId: id,
      oldValue: { sku: item.sku, name: item.name },
    });
    await this.repo.delete(id);
    this.eventsGateway.emitInventoryUpdate();
    return { deleted: true };
  }

  findAllForSelection() {
    return this.repo
      .createQueryBuilder('inventory')
      .select(['inventory.id', 'inventory.sku', 'inventory.name', 'inventory.availableQuantity'])
      .where('inventory.availableQuantity > 0')
      .orderBy('inventory.name', 'ASC')
      .getMany();
  }
}
