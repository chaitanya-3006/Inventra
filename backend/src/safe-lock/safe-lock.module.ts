import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SafeLock } from './safe-lock.entity';
import { SafeLockService } from './safe-lock.service';
import { SafeLockController } from './safe-lock.controller';
import { Inventory } from '../inventory/inventory.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SafeLock, Inventory, User])],
  providers: [SafeLockService],
  controllers: [SafeLockController],
  exports: [SafeLockService],
})
export class SafeLockModule {}
