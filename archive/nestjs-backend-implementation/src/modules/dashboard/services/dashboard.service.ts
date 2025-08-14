import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Order } from '../../../models/order.model';
import { OrderItem } from '../../../models/order-item.model';
import { Escalation } from '../../../models/escalation.model';
import { 
  DashboardSummaryDto, 
  KpiCardDto, 
  ChartDataPointDto, 
  ChannelPerformanceDto,
  FulfillmentByBranchDto,
  RecentOrderDto 
} from '../dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  private readonly CACHE_TTL = 30000; // 30 seconds
  private summaryCache: { data: DashboardSummaryDto; timestamp: number } | null = null;

  // Tops store branches for fulfillment performance (as per requirements)
  private readonly TOPS_STORES = [
    'Tops Central Plaza ลาดพร้าว',
    'Tops Central World', 
    'Tops สุขุมวิท 39',
    'Tops ทองหล่อ',
    'Tops สีลม คอมเพล็กซ์',
    'Tops เอกมัย',
    'Tops พร้อมพงษ์',
    'Tops จตุจักร'
  ];

  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
    @InjectModel(Escalation)
    private escalationModel: typeof Escalation,
  ) {}

  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    // Check cache first
    if (this.summaryCache && Date.now() - this.summaryCache.timestamp < this.CACHE_TTL) {
      return this.summaryCache.data;
    }

    const [kpis, charts, recentOrders, alerts] = await Promise.all([
      this.getKpis(),
      this.getCharts(),
      this.getRecentOrders(),
      this.getAlertsummary(),
    ]);

    const summary: DashboardSummaryDto = {
      kpis,
      charts,
      recent_orders: recentOrders,
      alerts,
      last_updated: new Date(),
      data_freshness: 0,
      cache_ttl: this.CACHE_TTL / 1000,
    };

    // Update cache
    this.summaryCache = {
      data: summary,
      timestamp: Date.now(),
    };

    return summary;
  }

  private async getKpis() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const [
      ordersProcessing,
      slaBreaches,
      todayRevenue,
      yesterdayRevenue,
      avgProcessingTime,
      activeOrders,
      fulfilledOrders,
      totalOrders,
      yesterdayProcessing,
      yesterdayBreaches,
      yesterdayActive,
    ] = await Promise.all([
      this.orderModel.count({ where: { status: 'PROCESSING' } }),
      this.orderModel.count({ where: { sla_status: 'BREACH' } }),
      this.calculateRevenue(todayStart, now),
      this.calculateRevenue(yesterdayStart, todayStart),
      this.calculateAverageProcessingTime(),
      this.orderModel.count({ where: { status: { [Op.in]: ['PENDING', 'PROCESSING'] } } }),
      this.orderModel.count({ where: { status: 'DELIVERED' } }),
      this.orderModel.count(),
      this.orderModel.count({ 
        where: { 
          status: 'PROCESSING',
          created_at: { [Op.between]: [yesterdayStart, todayStart] }
        }
      }),
      this.orderModel.count({ 
        where: { 
          sla_status: 'BREACH',
          created_at: { [Op.between]: [yesterdayStart, todayStart] }
        }
      }),
      this.orderModel.count({ 
        where: { 
          status: { [Op.in]: ['PENDING', 'PROCESSING'] },
          created_at: { [Op.between]: [yesterdayStart, todayStart] }
        }
      }),
    ]);

    const fulfillmentRate = totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0;

    return {
      orders_processing: {
        title: 'Orders Processing',
        value: ordersProcessing,
        change: this.calculateChange(ordersProcessing, yesterdayProcessing),
        trend: this.getTrend(ordersProcessing, yesterdayProcessing),
        format: 'number' as const,
        icon: 'package',
        description: 'Currently being processed',
      },
      sla_breaches: {
        title: 'SLA Breaches',
        value: slaBreaches,
        change: this.calculateChange(slaBreaches, yesterdayBreaches),
        trend: this.getTrend(slaBreaches, yesterdayBreaches, true), // Inverse trend for breaches
        format: 'number' as const,
        icon: 'alert-triangle',
        description: 'Orders exceeding SLA',
      },
      revenue_today: {
        title: 'Revenue Today',
        value: todayRevenue,
        change: this.calculateChange(todayRevenue, yesterdayRevenue),
        trend: this.getTrend(todayRevenue, yesterdayRevenue),
        format: 'currency' as const,
        icon: 'dollar-sign',
        description: 'Total revenue for today',
      },
      avg_processing_time: {
        title: 'Avg Processing Time',
        value: `${avgProcessingTime}m`,
        change: 0, // Would need historical data
        trend: 'stable' as const,
        format: 'time' as const,
        icon: 'clock',
        description: 'Average order processing time',
      },
      active_orders: {
        title: 'Active Orders',
        value: activeOrders,
        change: this.calculateChange(activeOrders, yesterdayActive),
        trend: this.getTrend(activeOrders, yesterdayActive),
        format: 'number' as const,
        icon: 'shopping-cart',
        description: 'Pending and processing orders',
      },
      fulfillment_rate: {
        title: 'Fulfillment Rate',
        value: Math.round(fulfillmentRate),
        change: 0, // Would need historical data
        trend: 'stable' as const,
        format: 'percentage' as const,
        icon: 'trending-up',
        description: 'Orders successfully delivered',
      },
    };
  }

  private async getCharts() {
    const [
      dailyOrders,
      hourlyOrders,
      slaCompliance,
      processingTimes,
      channelPerformance,
      fulfillmentByBranch,
      topProducts,
      revenueByCategory,
    ] = await Promise.all([
      this.getDailyOrdersData(),
      this.getHourlyOrdersData(),
      this.getSlaComplianceData(),
      this.getProcessingTimesData(),
      this.getChannelPerformanceData(),
      this.getFulfillmentByBranchData(),
      this.getTopProductsData(),
      this.getRevenueByCategoryData(),
    ]);

    return {
      daily_orders: dailyOrders,
      hourly_summary: hourlyOrders,
      sla_compliance: slaCompliance,
      processing_times: processingTimes,
      channel_performance: channelPerformance,
      fulfillment_by_branch: fulfillmentByBranch,
      top_products: topProducts,
      revenue_by_category: revenueByCategory,
    };
  }

  private async getRecentOrders(): Promise<RecentOrderDto[]> {
    const orders = await this.orderModel.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
    });

    return orders.map(order => ({
      id: order.id,
      order_no: order.order_no,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      status: order.status,
      sla_status: order.sla_status,
      elapsed_time: order.sla_elapsed_minutes,
      priority: order.priority,
      created_at: order.created_at,
    }));
  }

  private async getAlertsummary() {
    const [criticalEscalations, warnings, approachingSla] = await Promise.all([
      this.escalationModel.count({ 
        where: { 
          severity: 'CRITICAL',
          status: { [Op.in]: ['PENDING', 'SENT'] }
        }
      }),
      this.escalationModel.count({ 
        where: { 
          severity: { [Op.in]: ['HIGH', 'MEDIUM'] },
          status: { [Op.in]: ['PENDING', 'SENT'] }
        }
      }),
      this.orderModel.count({ where: { sla_status: 'NEAR_BREACH' } }),
    ]);

    return {
      critical_count: criticalEscalations,
      warnings_count: warnings,
      approaching_sla_count: approachingSla,
    };
  }

  // Chart data methods
  private async getDailyOrdersData(): Promise<ChartDataPointDto[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = await this.orderModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('order_date')), 'date'],
        [Sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: {
        order_date: { [Op.gte]: sevenDaysAgo },
      },
      group: [Sequelize.fn('DATE', Sequelize.col('order_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('order_date')), 'ASC']],
      raw: true,
    }) as any[];

    return results.map(result => ({
      name: result.date,
      value: parseInt(result.count),
      date: result.date,
    }));
  }

  private async getHourlyOrdersData(): Promise<ChartDataPointDto[]> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const results = await this.orderModel.findAll({
      attributes: [
        [Sequelize.fn('EXTRACT', Sequelize.literal('HOUR FROM order_date')), 'hour'],
        [Sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: {
        order_date: { [Op.gte]: todayStart },
      },
      group: [Sequelize.fn('EXTRACT', Sequelize.literal('HOUR FROM order_date'))],
      order: [[Sequelize.fn('EXTRACT', Sequelize.literal('HOUR FROM order_date')), 'ASC']],
      raw: true,
    }) as any[];

    return results.map(result => ({
      name: `${result.hour}:00`,
      value: parseInt(result.count),
    }));
  }

  private async getSlaComplianceData(): Promise<ChartDataPointDto[]> {
    const results = await this.orderModel.findAll({
      attributes: [
        'sla_status',
        [Sequelize.fn('COUNT', '*'), 'count'],
      ],
      group: ['sla_status'],
      raw: true,
    }) as any[];

    return results.map(result => ({
      name: result.sla_status,
      value: parseInt(result.count),
    }));
  }

  private async getProcessingTimesData(): Promise<ChartDataPointDto[]> {
    // Implementation for processing times histogram
    return [
      { name: '0-5m', value: 45 },
      { name: '5-10m', value: 32 },
      { name: '10-15m', value: 18 },
      { name: '15-20m', value: 12 },
      { name: '20+m', value: 8 },
    ];
  }

  private async getChannelPerformanceData(): Promise<ChannelPerformanceDto[]> {
    const results = await this.orderModel.findAll({
      attributes: [
        'channel',
        [Sequelize.fn('COUNT', '*'), 'orders'],
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'revenue'],
        [Sequelize.fn('AVG', Sequelize.col('sla_elapsed_minutes')), 'avg_processing_time'],
      ],
      group: ['channel'],
      raw: true,
    }) as any[];

    return results.map(result => ({
      channel: result.channel,
      orders: parseInt(result.orders),
      revenue: parseFloat(result.revenue || 0),
      avg_processing_time: Math.round(parseFloat(result.avg_processing_time || 0)),
      sla_compliance_rate: 95, // Would calculate from SLA data
      growth_rate: 0, // Would calculate from historical data
    }));
  }

  private async getFulfillmentByBranchData(): Promise<FulfillmentByBranchDto[]> {
    // Filter only Tops stores as per requirements
    const results = await this.orderModel.findAll({
      attributes: [
        'store_name',
        [Sequelize.fn('COUNT', '*'), 'total_orders'],
        [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'DELIVERED' THEN 1 END")), 'fulfilled_orders'],
      ],
      where: {
        store_name: { [Op.in]: this.TOPS_STORES },
      },
      group: ['store_name'],
      raw: true,
    }) as any[];

    return results.map(result => {
      const total = parseInt(result.total_orders);
      const fulfilled = parseInt(result.fulfilled_orders || 0);
      const rate = total > 0 ? (fulfilled / total) * 100 : 0;

      return {
        branch: result.store_name,
        orders: total,
        fulfilled: fulfilled,
        rate: Math.round(rate * 100) / 100,
        avg_time: 25, // Would calculate from actual data
      };
    });
  }

  private async getTopProductsData(): Promise<ChartDataPointDto[]> {
    const results = await this.orderItemModel.findAll({
      attributes: [
        'product_name',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'total_quantity'],
        [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_revenue'],
      ],
      group: ['product_name'],
      order: [[Sequelize.fn('SUM', Sequelize.col('total_price')), 'DESC']],
      limit: 10,
      raw: true,
    }) as any[];

    return results.map(result => ({
      name: result.product_name,
      value: parseFloat(result.total_revenue),
      metadata: {
        quantity: parseInt(result.total_quantity),
      },
    }));
  }

  private async getRevenueByCategoryData(): Promise<ChartDataPointDto[]> {
    const results = await this.orderItemModel.findAll({
      attributes: [
        'product_category',
        [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total_revenue'],
      ],
      where: {
        product_category: { [Op.ne]: null },
      },
      group: ['product_category'],
      order: [[Sequelize.fn('SUM', Sequelize.col('total_price')), 'DESC']],
      raw: true,
    }) as any[];

    return results.map(result => ({
      name: result.product_category || 'Other',
      value: parseFloat(result.total_revenue),
    }));
  }

  // Helper methods
  private async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.orderModel.sum('total_amount', {
      where: {
        order_date: { [Op.between]: [startDate, endDate] },
        status: { [Op.ne]: 'CANCELLED' },
      },
    });

    return result || 0;
  }

  private async calculateAverageProcessingTime(): Promise<number> {
    const result = await this.orderModel.findAll({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('sla_elapsed_minutes')), 'avg_time']],
      where: { status: { [Op.in]: ['PROCESSING', 'DELIVERED'] } },
      raw: true,
    }) as any[];

    return Math.round(parseFloat(result[0]?.avg_time || 0) / 60); // Convert to minutes
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private getTrend(current: number, previous: number, inverse = false): 'up' | 'down' | 'stable' {
    const diff = current - previous;
    if (Math.abs(diff) < 0.05 * previous) return 'stable';
    
    const trend = diff > 0 ? 'up' : 'down';
    return inverse ? (trend === 'up' ? 'down' : 'up') : trend;
  }
}