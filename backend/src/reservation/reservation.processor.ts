import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../events/events.gateway';
import axios from 'axios';

const GO_SERVICE = process.env.GO_SERVICE_URL || 'http://go-service:8081';

@Processor('reservation-queue')
export class ReservationProcessor extends WorkerHost {
  constructor(
    private auditService: AuditService,
    private eventsGateway: EventsGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-reserve':
        return this.processReserve(job);
      case 'process-confirm':
        return this.processConfirm(job);
      case 'process-cancel':
        return this.processCancel(job);
      case 'process-extend':
        return this.processExtend(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async processReserve(job: Job): Promise<any> {
    const { inventoryId, userId, quantity, dto } = job.data;
    try {
      const response = await axios.post(`${GO_SERVICE}/reserve`, {
        inventory_id: inventoryId,
        user_id: userId,
        quantity: quantity,
      });

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Created (Pending)',
        entityType: 'reservation',
        entityId: inventoryId,
        newValue: dto,
      });

      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. Go works on it and done`);
      console.log(inventoryId);
      return response.data;
    } catch (error) {
      console.error('Reserve job failed', error);
      throw error;
    }
  }

  private async processConfirm(job: Job): Promise<any> {
    const { reservationId, userId, isAdmin } = job.data;
    try {
      const response = await axios.post(`${GO_SERVICE}/confirm`, {
        reservation_id: reservationId,
        user_id: userId,
        is_admin: isAdmin,
      });

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Updated',
        entityType: 'reservation',
        entityId: reservationId,
        newValue: { status: 'CONFIRMED' },
      });
      
      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. Go works on it and done`);

      return response.data;
    } catch (error) {
      console.error('Confirm job failed', error);
      throw error;
    }
  }

  private async processCancel(job: Job): Promise<any> {
    const { reservationId, userId, isAdmin } = job.data;
    try {
      const response = await axios.post(`${GO_SERVICE}/cancel`, {
        reservation_id: reservationId,
        user_id: userId,
        is_admin: isAdmin,
      });

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Canceled',
        entityType: 'reservation',
        entityId: reservationId,
        newValue: { status: 'CANCELLED' },
      });

      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. Go works on it and done`);

      return response.data;
    } catch (error) {
      console.error('Cancel job failed', error);
      throw error;
    }
  }

  private async processExtend(job: Job): Promise<any> {
    const { reservationId, userId, durationMinutes } = job.data;
    try {
      const response = await axios.post(`${GO_SERVICE}/extend`, {
        reservation_id: reservationId,
        user_id: userId,
        duration_minutes: durationMinutes,
      });

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Extended',
        entityType: 'reservation',
        entityId: reservationId,
        newValue: { action: `Extended ${durationMinutes} minutes` },
      });

      this.eventsGateway.emitReservationUpdate();
      return response.data;
    } catch (error) {
      console.error('Extend job failed', error);
      throw error;
    }
  }
}
