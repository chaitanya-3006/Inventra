import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { User } from '../users/user.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History) private historyRepo: Repository<History>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10, filters?: {
    status?: string;
    operator?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }, userId?: string, role?: string) {
    const query = this.historyRepo
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .leftJoinAndSelect('history.inventory', 'inventory');

    if (role !== 'admin' && userId) {
      query.andWhere('history.userId = :userId', { userId });
    }

    if (filters?.status && filters.status !== 'All Status') {
      query.andWhere('history.status = :status', { status: filters.status.toUpperCase() });
    }

    if (filters?.operator && filters.operator !== 'All Operators') {
      query.andWhere('user.username = :operator', { operator: filters.operator });
    }

    if (filters?.startDate) {
      query.andWhere('history.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('history.createdAt <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.search) {
      query.andWhere(
        '(history.id ILIKE :search OR inventory.sku ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    const [data, total] = await query
      .orderBy('history.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const formattedData = data.map((item) => {
      return {
        id: item.id,
        sku: `RES-${item.id.substring(0, 4).toUpperCase()}`,
        operator: {
          id: item.userId,
          name: item.user?.username || 'Unknown',
          avatar: item.user?.username?.charAt(0).toUpperCase() || 'U',
        },
        items: item.inventory ? [{ name: item.inventory.name, quantity: item.quantity }] : [],
        requestedAt: item.createdAt,
        status: (item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()) as 'Confirmed' | 'Expired' | 'Cancelled',
      };
    });

    return { data: formattedData, total };
  }

  async getStats(userId?: string, role?: string) {
    const queryBuilder = (status: string) => {
      const qb = this.historyRepo.createQueryBuilder('history')
        .where('history.status = :status', { status });
      
      if (role !== 'admin' && userId) {
        qb.andWhere('history.userId = :userId', { userId });
      }
      
      return qb.getCount();
    };

    const [confirmed, expired, cancelled] = await Promise.all([
      queryBuilder('CONFIRMED'),
      queryBuilder('EXPIRED'),
      queryBuilder('CANCELLED'),
    ]);

    return { confirmed, expired, cancelled };
  }
}
