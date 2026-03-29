import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController, AuditLogsController } from './audit.controller';
import { AuditLog } from './audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService],
  controllers: [AuditController, AuditLogsController],
  exports: [AuditService],
})
export class AuditModule {}