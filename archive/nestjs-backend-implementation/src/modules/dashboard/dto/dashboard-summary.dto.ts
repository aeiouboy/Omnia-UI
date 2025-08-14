export class KpiCardDto {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage' | 'time';
  icon: string;
  description?: string;
}

export class ChartDataPointDto {
  name: string;
  value: number;
  date?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export class ChannelPerformanceDto {
  channel: string;
  orders: number;
  revenue: number;
  avg_processing_time: number;
  sla_compliance_rate: number;
  growth_rate: number;
}

export class FulfillmentByBranchDto {
  branch: string;
  orders: number;
  fulfilled: number;
  rate: number;
  avg_time: number;
}

export class RecentOrderDto {
  id: string;
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: string;
  sla_status: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';
  elapsed_time: number;
  priority: string;
  created_at: Date;
}

export class DashboardSummaryDto {
  // KPI Cards
  kpis: {
    orders_processing: KpiCardDto;
    sla_breaches: KpiCardDto;
    revenue_today: KpiCardDto;
    avg_processing_time: KpiCardDto;
    active_orders: KpiCardDto;
    fulfillment_rate: KpiCardDto;
  };

  // Chart Data
  charts: {
    daily_orders: ChartDataPointDto[];
    hourly_summary: ChartDataPointDto[];
    sla_compliance: ChartDataPointDto[];
    processing_times: ChartDataPointDto[];
    channel_performance: ChannelPerformanceDto[];
    fulfillment_by_branch: FulfillmentByBranchDto[];
    top_products: ChartDataPointDto[];
    revenue_by_category: ChartDataPointDto[];
  };

  // Recent Data
  recent_orders: RecentOrderDto[];
  
  // Alerts Summary
  alerts: {
    critical_count: number;
    warnings_count: number;
    approaching_sla_count: number;
  };

  // Metadata
  last_updated: Date;
  data_freshness: number; // seconds since last update
  cache_ttl: number;
}