import { Module } from '@nestjs/common';
import { ReservationController, ReservationsController } from './reservation.controller';
import { AuditModule } from '../audit/audit.module';

@Module({ 
  imports: [AuditModule],
  controllers: [ReservationController, ReservationsController] 
})
export class ReservationModule {}
