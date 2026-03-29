import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './history.entity';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { Inventory } from '../inventory/inventory.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([History, Inventory, User])],
  providers: [HistoryService],
  controllers: [HistoryController],
  exports: [HistoryService],
})
export class HistoryModule {}
