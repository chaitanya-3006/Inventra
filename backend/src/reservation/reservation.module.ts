import { Module } from '@nestjs/common';
import { ReservationController, ReservationsController } from './reservation.controller';
import { AuditModule } from '../audit/audit.module';
import { BullModule } from '@nestjs/bullmq';
import { ReservationProcessor } from './reservation.processor';
import { HistoryController } from './history.controller';

@Module({ 
  imports: [
    AuditModule,
    BullModule.registerQueue({
      name: 'reservation-queue',
    }),
  ],
  providers: [ReservationProcessor],
  controllers: [ReservationController, ReservationsController, HistoryController] 
})
export class ReservationModule {}
