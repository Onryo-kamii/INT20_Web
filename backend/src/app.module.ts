import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller.js';
import { UsersService } from './users/users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Now you can use __dirname like before
console.log(__dirname);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'orders.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    OrdersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
