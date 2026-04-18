import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import axios from 'axios';

const GO_SERVICE = process.env.GO_SERVICE_URL || 'http://go-service:8081';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  @Get()
  async getHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('operator') operator?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    try {
      const response = await axios.get(`${GO_SERVICE}/history`, {
        params: { page, limit, status, operator, startDate, endDate, search },
      });
      return response.data;
    } catch (e: any) {
      throw new HttpException('Could not fetch history', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  async getHistoryStats() {
    try {
      const response = await axios.get(`${GO_SERVICE}/history/stats`);
      return response.data;
    } catch (e: any) {
      throw new HttpException('Could not fetch history stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
