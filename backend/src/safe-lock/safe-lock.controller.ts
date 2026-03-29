import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SafeLockService } from './safe-lock.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('safe-lock')
@UseGuards(JwtAuthGuard)
export class SafeLockController {
  constructor(private safeLockService: SafeLockService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('expiry') expiry?: string,
    @Query('search') search?: string,
  ) {
    return this.safeLockService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      { expiry, search }
    );
  }

  @Get('stats')
  getStats() {
    return this.safeLockService.getStats();
  }

  @Post('lock')
  lock(
    @Body() dto: { inventoryId: string; quantity: number; expiresAt?: string; permanent?: boolean },
    @Request() req: any,
  ) {
    return this.safeLockService.lock(
      dto.inventoryId,
      dto.quantity,
      req.user.userId,
      dto.expiresAt,
      dto.permanent || false
    );
  }

  @Post('unlock/:id')
  unlock(@Param('id') id: string) {
    return this.safeLockService.unlock(id);
  }
}
