export interface RealtimeUpdateDto {
  type: 'ORDER_UPDATE' | 'SLA_BREACH' | 'DASHBOARD_REFRESH' | 'SYSTEM_ALERT';
  payload: any;
  timestamp: Date;
  source: string;
}

export interface OrderUpdateDto {
  order_id: string;
  order_no: string;
  old_status?: string;
  new_status: string;
  sla_status: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';
  customer_name: string;
  total_amount: number;
  elapsed_time: number;
}

export interface SlaBreachDto {
  order_id: string;
  order_no: string;
  customer_name: string;
  elapsed_time: number;
  target_time: number;
  severity: 'HIGH' | 'CRITICAL';
  breach_percentage: number;
}

export interface DashboardRefreshDto {
  affected_kpis: string[];
  updated_counts: {
    orders_processing?: number;
    sla_breaches?: number;
    active_orders?: number;
  };
}

export interface SystemAlertDto {
  alert_type: 'API_ERROR' | 'DATABASE_ERROR' | 'SERVICE_DEGRADATION' | 'HIGH_LOAD';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_services: string[];
}

export interface ClientSubscriptionDto {
  client_id: string;
  subscriptions: Array<{
    type: 'orders' | 'dashboard' | 'alerts' | 'all';
    filters?: {
      order_ids?: string[];
      channels?: string[];
      priorities?: string[];
    };
  }>;
}