import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity.js';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { CsvRow } from '../csvrow.js';
import { counties } from '../ny_counties/counties.js';
import * as turf from '@turf/turf';
import { point, polygon, multiPolygon } from '@turf/turf';
import { DeleteResult } from 'typeorm/browser';
import { OrderDto } from './orderDto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async processCsvBuffer(buffer: Buffer): Promise<void> {
    const orders: Order[] = [];

    const stream = Readable.from(buffer.toString());

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv({ separator: ',' }))
        .on('data', (row: CsvRow) => {
          orders.push({
            id: Number(row.id),
            longitude: Number(row.longitude),
            latitude: Number(row.latitude),
            timestamp: row.timestamp,
            subtotal: Number(row.subtotal),
          });
        })
        .on('end', () => {
          this.orderRepository
            .save(orders)
            .then(() => resolve())
            .catch(reject);
        })
        .on('error', reject);
    });
  }

  async getAll(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find();
    return orders.map((order) => {
      const compositeTaxRate = this.calculate_taxes(
        order.longitude,
        order.latitude,
      );
      const taxAmount = (order.subtotal * compositeTaxRate) / 100;
      const totalAmount = order.subtotal + taxAmount;
      const jurisdiction = this.get_juristiction(
        order.longitude,
        order.latitude,
      );

      const dto: OrderDto = {
        id: order.id,
        latitude: order.latitude,
        longitude: order.longitude,
        timestamp: order.timestamp,
        subtotal: order.subtotal,
        composite_tax_rate: compositeTaxRate,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        jurisdiction: jurisdiction,
      };

      return dto;
    });
  }

  async deleteAll(): Promise<DeleteResult> {
    return this.orderRepository.deleteAll();
  }

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  get_juristiction(x: number, y: number): string {
    const pt = point([x, y]);

    for (const county of counties) {
      if (county.geometry.type === 'Polygon') {
        const poly = polygon(county.geometry.coordinates);
        if (turf.booleanPointInPolygon(pt, poly)) {
          return county.name;
        }
      } else if (county.geometry.type === 'MultiPolygon') {
        const multi = multiPolygon(county.geometry.coordinates);
        if (turf.booleanPointInPolygon(pt, multi)) {
          return county.name;
        }
      }
    }

    return 'Not Found';
  }

  calculate_taxes(x: number, y: number): number {
    const pt = point([x, y]);

    for (const county of counties) {
      if (county.geometry.type === 'Polygon') {
        const poly = polygon(county.geometry.coordinates);
        if (turf.booleanPointInPolygon(pt, poly)) {
          return 4 + county.tax;
        }
      } else if (county.geometry.type === 'MultiPolygon') {
        const multi = multiPolygon(county.geometry.coordinates);
        if (turf.booleanPointInPolygon(pt, multi)) {
          return 4 + county.tax;
        }
      }
    }

    return 0;
  }
}
