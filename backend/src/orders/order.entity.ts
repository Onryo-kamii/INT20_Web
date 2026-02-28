import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryColumn()
  id: number;

  @Column('float')
  longitude: number;

  @Column('float')
  latitude: number;

  @Column()
  timestamp: string;

  @Column('float')
  subtotal: number;
}
