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

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }
}
