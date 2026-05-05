import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  log(data: Partial<AuditLog>) {
    const entry = this.repo.create(data);
    return this.repo.save(entry);
  }

  async findAll(
    page = 1, 
    limit = 10, 
    filters?: {
      action?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ) {
    const query = this.repo.createQueryBuilder('audit');

    if (filters?.action && filters.action !== 'All Actions') {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.search) {
      query.andWhere(
        '(CAST(audit.id AS varchar) ILIKE :search OR CAST(audit.entityId AS varchar) ILIKE :search OR CAST(audit.entityType AS varchar) ILIKE :search OR CAST(audit.oldValue AS text) ILIKE :search OR CAST(audit.newValue AS text) ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const [data, total] = await query
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const formattedData = data.map(item => ({
      id: item.id,
      userId: item.userId,
      userName: item.userId ? 'admin' : 'System',
      userRole: 'Admin',
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      oldValue: item.oldValue,
      newValue: item.newValue,
      ipAddress: '192.168.1.1',
      createdAt: item.createdAt,
    }));

    return { data: formattedData, total };
  }
}
