import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReserveDto, ConfirmDto, CancelDto } from './dto/reserve.dto';
import axios from 'axios';
import { AuditService } from '../audit/audit.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const GO_SERVICE = process.env.GO_SERVICE_URL || 'http://go-service:8081';

@Controller('reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(
    private auditService: AuditService,
    @InjectQueue('reservation-queue') private reservationQueue: Queue,
  ) {}

  @Post()
  async reserve(@Body() dto: ReserveDto, @Request() req: any) {
    try {
      console.log(`1. Request created for user ID: ${req.user.userId}`);
      const job = await this.reservationQueue.add('process-reserve', {
        inventoryId: dto.inventoryId,
        userId: req.user.userId,
        quantity: dto.quantity,
        dto: dto,
      });
      console.log(`2. Added to the queue with Job ID: ${job?.id}`);
      return { message: 'Reservation request queued', jobId: job.id };
    } catch (e: any) {
      throw new HttpException(
        'Failed to queue reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('confirm')
  async confirm(@Body() dto: ConfirmDto, @Request() req: any) {
    try {
      console.log(`1. Request created for user ID: ${req.user.userId}`);
      const isAdmin = req.user.role === 'admin';
      const job = await this.reservationQueue.add('process-confirm', {
        reservationId: dto.reservationId,
        userId: req.user.userId,
        isAdmin: isAdmin,
      });
      console.log(`2. Added to the queue with Job ID: ${job?.id}`);
      return { message: 'Confirm request queued', jobId: job.id };
    } catch (e: any) {
      throw new HttpException(
        'Failed to queue confirm',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cancel')
  async cancel(@Body() dto: CancelDto, @Request() req: any) {
    try {
      console.log(`1. Request created for user ID: ${req.user.userId}`);
      const isAdmin = req.user.role === 'admin';
      const job = await this.reservationQueue.add('process-cancel', {
        reservationId: dto.reservationId,
        userId: req.user.userId,
        isAdmin: isAdmin,
      });
      console.log(`2. Added to the queue with Job ID: ${job?.id}`);
      return { message: 'Cancel request queued', jobId: job.id };
    } catch (e: any) {
      throw new HttpException(
        'Failed to queue cancel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  @Get('user')
  async getMyReservations(@Request() req: any) {
    try {
      const response = await axios.get(
        `${GO_SERVICE}/reservations/user/${req.user.userId}`,
      );
      return response.data;
    } catch (e: any) {
      console.error('Proxy Error to Go Service:', e.message, e?.response?.data || '');
      throw new HttpException(
        'Could not fetch reservations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  @Get()
  async getAllReservations(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    try {
      const response = await axios.get(`${GO_SERVICE}/reservations`, {
        params: { page, limit, status },
      });
      return response.data;
    } catch (e: any) {
      throw new HttpException(
        'Could not fetch reservations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
