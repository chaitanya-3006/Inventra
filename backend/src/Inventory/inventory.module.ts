import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Inventory } from './inventory.entity';
import { AuditModule } from '../audit/audit.module';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), AuditModule],
  providers: [InventoryService, CloudinaryService],
  controllers: [InventoryController],
  exports: [InventoryService, CloudinaryService],
})
export class InventoryModule {}

