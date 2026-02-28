export class OrderDto {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  subtotal: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  jurisdiction: string;
}
