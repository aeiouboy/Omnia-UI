import { Type } from 'class-transformer';

export class OrderItemResponseDto {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_details?: {
    description: string;
    category: string;
    brand: string;
  };
}

export class CustomerResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export class ShippingAddressDto {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export class PaymentInfoDto {
  method: string;
  status: string;
  transaction_id?: string;
}

export class SlaInfoDto {
  target_minutes: number;
  elapsed_minutes: number;
  status: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';
  remaining_minutes?: number;
  breach_percentage?: number;
}

export class MetadataDto {
  created_at: Date;
  updated_at: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  store_name: string;
}

export class OrderResponseDto {
  id: string;
  order_no: string;
  
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;
  
  order_date: Date;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  channel: string;
  business_unit: string;
  order_type: string;
  
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];
  
  total_amount: number;
  
  @Type(() => ShippingAddressDto)
  shipping_address: ShippingAddressDto;
  
  @Type(() => PaymentInfoDto)
  payment_info: PaymentInfoDto;
  
  @Type(() => SlaInfoDto)
  sla_info: SlaInfoDto;
  
  @Type(() => MetadataDto)
  metadata: MetadataDto;
}

export class PaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedOrdersResponseDto {
  @Type(() => OrderResponseDto)
  data: OrderResponseDto[];
  
  @Type(() => PaginationDto)
  pagination: PaginationDto;
  
  filters: Record<string, any>;
}