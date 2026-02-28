import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  ParseFloatPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { OrdersService } from './orders.service.js';
import { Order } from './order.entity.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get()
  async getAllOrders(): Promise<string> {
    const orders = await this.orderService.getAll();
    return JSON.stringify(orders);
  }

  @Get('taxes')
  calculateTaxes(
    @Query('x', ParseFloatPipe) x: number,
    @Query('y', ParseFloatPipe) y: number,
  ) {
    const taxes = this.orderService.calculate_taxes(x, y);
    return taxes;
  }

  @Post()
  createOrder(@Body() orderData: Partial<Order>): Promise<Order> {
    return this.orderService.create(orderData);
  }

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  async importOrders(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    await this.orderService.processCsvBuffer(file.buffer);
    return 'Imports';
  }

  @Delete()
  async deleteOrders() {
    await this.orderService.deleteAll();
    return;
  }
}
