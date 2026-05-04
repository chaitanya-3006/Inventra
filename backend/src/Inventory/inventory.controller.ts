import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InventoryService } from './inventory.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(
    private inventoryService: InventoryService,
    private cloudinaryService: CloudinaryService
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;
    const [data, total] = await this.inventoryService.findAll(pageNum, limitNum, search);
    return { data, total };
  }

  @Get('stats')
  getStats() {
    return this.inventoryService.getStats();
  }

  @Get('for-selection')
  findAllForSelection() {
    return this.inventoryService.findAllForSelection();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInventoryDto, @Request() req: any) {
    return this.inventoryService.create(dto, req.user.userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.cloudinaryService.uploadImage(file);
    return { url: result.secure_url };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDto, @Request() req: any) {
    return this.inventoryService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.remove(id, req.user.userId);
  }
}
