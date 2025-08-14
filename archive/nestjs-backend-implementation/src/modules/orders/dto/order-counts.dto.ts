export class OrderCountsResponseDto {
  breach_count: number;
  near_breach_count: number;
  submitted_count: number;
  on_hold_count: number;
  total_processing: number;
  
  // Additional metrics
  today_orders: number;
  urgent_orders: number;
  compliance_rate: number;
  
  // Performance metrics
  avg_processing_time: number;
  fulfillment_rate: number;
  
  // Timestamp for cache validation
  timestamp: Date;
  cache_ttl_seconds: number;
}