import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('operator') operator?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    const userId = req.user.userId;
    const role = req.user.role || 'user';
    
    return this.historyService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      { status, operator, startDate, endDate, search },
      userId,
      role
    );
  }

  @Get('stats')
  getStats(@Request() req: any) {
    const userId = req.user.userId;
    const role = req.user.role || 'user';
    return this.historyService.getStats(userId, role);
  }
}
