import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  testConnection() {
    return {
      message: 'Backend connected successfully',
    };
  }

  @Get('health')
  healthCheck() {
    return this.appService.getHealth();
  }
}