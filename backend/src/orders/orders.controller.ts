import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { OrdersService } from './orders.service';
import { Order } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Get()
  async getAllOrders(): Promise<string> {
    const orders = await this.orderService.getAll();
    return JSON.stringify(orders);
  }

  @Get('counties')
  getAllCounties() {
    const counties = this.orderService.get_counties();
    return counties;
  }

  @Get('taxes')
  calculateTaxes(@Param() x: number, @Param() y: number) {
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
}
