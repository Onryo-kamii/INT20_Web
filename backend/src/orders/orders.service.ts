import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { CsvRow } from 'src/csvrow';
import { County } from 'src/ny_counties/county';
import { counties } from 'src/ny_counties/counties';
import * as turf from '@turf/turf';
import { point, polygon, multiPolygon } from '@turf/turf';

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

  async getAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async create(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(data);
    return this.orderRepository.save(order);
  }

  get_counties(): County {
    // let res = '';
    // counties.forEach((county) => {
    //   res += county.name + '\n';
    // });
    return counties[0];
  }

  calculate_taxes(x: number, y: number): string {
    // 1. Get point in which county is our tax
    // Calculate 4% state tax (for whole NY) plus county tax
    const pt = point([x, y]);

    counties.forEach((county) => {
      if (county.geometry.type === 'Polygon') {
        const poly = polygon(county.geometry.coordinates);
        const isInCounty = turf.booleanPointInPolygon(pt, poly);
        if (isInCounty) return county.name;
        // use poly ...
      } else if (county.geometry.type === 'MultiPolygon') {
        const multi = multiPolygon(county.geometry.coordinates);
        const isInCounty = turf.booleanPointInPolygon(pt, multi);
        if (isInCounty) return county.name;
        // use multi ...
      }
    });
    // let res = turf.booleanPointInPolygon(point, polygon);
    // return res;
    return 'Not Found';
  }
}
