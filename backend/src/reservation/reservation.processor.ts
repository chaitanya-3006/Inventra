import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../events/events.gateway';
import { DataSource } from 'typeorm';
import { History } from '../history/history.entity';
import { Inventory } from '../inventory/inventory.entity';

@Processor('reservation-queue')
export class ReservationProcessor extends WorkerHost {
  constructor(
    private auditService: AuditService,
    private eventsGateway: EventsGateway,
    private dataSource: DataSource,
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
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async processReserve(job: Job): Promise<any> {
    const { inventoryId, userId, quantity, dto } = job.data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.id = :id', { id: inventoryId })
        .getOne();

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (inventory.availableQuantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Auto-confirm logic: deduct total immediately
      inventory.totalQuantity -= quantity;
      await queryRunner.manager.save(inventory);

      // Expires at +15 mins
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const reservation = queryRunner.manager.create(History, {
        inventoryId,
        userId,
        quantity,
        status: 'CONFIRMED',
        expiresAt,
      });
      const savedReservation = await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Auto-Confirmed',
        entityType: 'reservation',
        entityId: inventoryId,
        newValue: dto,
      });

      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. NestJS processed reservation internally`);
      
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Reserve job failed', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async processConfirm(job: Job): Promise<any> {
    const { reservationId, userId, isAdmin } = job.data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const query = queryRunner.manager
        .createQueryBuilder(History, 'res')
        .setLock('pessimistic_write')
        .where('res.id = :id', { id: reservationId });

      if (!isAdmin) {
        query.andWhere('res.userId = :userId', { userId });
      }

      const reservation = await query.getOne();

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'PENDING') {
        throw new Error(`Reservation is not in PENDING state, current status: ${reservation.status}`);
      }

      if (reservation.expiresAt && new Date() > reservation.expiresAt) {
        throw new Error('Reservation has expired');
      }

      const inventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.id = :id', { id: reservation.inventoryId })
        .getOne();

      if (inventory) {
        inventory.totalQuantity -= reservation.quantity;
        inventory.reservedQuantity -= reservation.quantity;
        await queryRunner.manager.save(inventory);
      }

      reservation.status = 'CONFIRMED';
      const savedReservation = await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Updated',
        entityType: 'reservation',
        entityId: reservationId,
        newValue: { status: 'CONFIRMED' },
      });
      
      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. NestJS processed confirm internally`);

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Confirm job failed', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async processCancel(job: Job): Promise<any> {
    const { reservationId, userId, isAdmin } = job.data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const query = queryRunner.manager
        .createQueryBuilder(History, 'res')
        .setLock('pessimistic_write')
        .where('res.id = :id', { id: reservationId });

      if (!isAdmin) {
        query.andWhere('res.userId = :userId', { userId });
      }

      const reservation = await query.getOne();

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== 'CONFIRMED') {
        throw new Error(`Only CONFIRMED reservations can be cancelled, current: ${reservation.status}`);
      }

      const inventory = await queryRunner.manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.id = :id', { id: reservation.inventoryId })
        .getOne();

      if (inventory) {
        inventory.totalQuantity += reservation.quantity;
        await queryRunner.manager.save(inventory);
      }

      reservation.status = 'CANCELLED';
      const savedReservation = await queryRunner.manager.save(reservation);

      await queryRunner.commitTransaction();

      await this.auditService.log({
        userId: userId,
        action: 'Reservation Canceled',
        entityType: 'reservation',
        entityId: reservationId,
        newValue: { status: 'CANCELLED' },
      });

      this.eventsGateway.emitReservationUpdate();
      this.eventsGateway.emitInventoryUpdate();
      console.log(`3. NestJS processed cancel internally`);

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Cancel job failed', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
