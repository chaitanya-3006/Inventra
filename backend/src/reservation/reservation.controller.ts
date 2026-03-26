import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReserveDto, ConfirmDto, CancelDto } from './dto/reserve.dto';
import axios from 'axios';

const GO_SERVICE = process.env.GO_SERVICE_URL || 'http://go-service:8081';

@Controller('reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  @Post()
  async reserve(@Body() dto: ReserveDto, @Request() req: any) {
    try {
      const response = await axios.post(`${GO_SERVICE}/reserve`, {
        inventory_id: dto.inventoryId,
        user_id: req.user.userId,
        quantity: dto.quantity,
      });
      return response.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data?.error || 'Reservation failed',
        e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('confirm')
  async confirm(@Body() dto: ConfirmDto, @Request() req: any) {
    try {
      const response = await axios.post(`${GO_SERVICE}/confirm`, {
        reservation_id: dto.reservationId,
        user_id: req.user.userId,
      });
      return response.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data?.error || 'Confirm failed',
        e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cancel')
  async cancel(@Body() dto: CancelDto, @Request() req: any) {
    try {
      const response = await axios.post(`${GO_SERVICE}/cancel`, {
        reservation_id: dto.reservationId,
        user_id: req.user.userId,
      });
      return response.data;
    } catch (e: any) {
      throw new HttpException(
        e.response?.data?.error || 'Cancel failed',
        e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
      throw new HttpException(
        'Could not fetch reservations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
