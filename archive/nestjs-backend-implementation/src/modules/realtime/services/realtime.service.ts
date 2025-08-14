import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Order } from '../../../models/order.model';
import { Escalation } from '../../../models/escalation.model';
import { DashboardService } from '../../dashboard/services/dashboard.service';
import { OrdersService } from '../../orders/services/orders.service';
import { SlaBreachDto, OrderUpdateDto } from '../dto/realtime.dto';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private lastBreachCheckTime: Date = new Date();

  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(Escalation)
    private escalationModel: typeof Escalation,
    private dashboardService: DashboardService,
    private ordersService: OrdersService,
  ) {}

  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  async getNewSlaBreaches(): Promise<SlaBreachDto[]> {
    try {
      // Get orders that have breached SLA since last check
      const newBreaches = await this.orderModel.findAll({
        where: {
          sla_status: 'BREACH',
          updated_at: {
            [Op.gt]: this.lastBreachCheckTime,
          },
        },
        limit: 10, // Limit to prevent overwhelming
      });

      this.lastBreachCheckTime = new Date();

      return newBreaches.map(order => ({
        order_id: order.id,
        order_no: order.order_no,
        customer_name: order.customer_name,
        elapsed_time: order.sla_elapsed_minutes,
        target_time: order.sla_target_minutes,
        severity: this.calculateBreachSeverity(order.sla_elapsed_minutes, order.sla_target_minutes),
        breach_percentage: Math.round((order.sla_elapsed_minutes / order.sla_target_minutes) * 100),
      }));

    } catch (error) {
      this.logger.error('Failed to get new SLA breaches:', error);
      return [];
    }
  }

  async getOrderUpdates(since: Date): Promise<OrderUpdateDto[]> {
    try {
      const updatedOrders = await this.orderModel.findAll({
        where: {
          updated_at: {
            [Op.gt]: since,
          },
        },
        order: [['updated_at', 'DESC']],
        limit: 20,
      });

      return updatedOrders.map(order => ({
        order_id: order.id,
        order_no: order.order_no,
        old_status: undefined, // Would need order history to track this
        new_status: order.status,
        sla_status: order.sla_status,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        elapsed_time: order.sla_elapsed_minutes,
      }));

    } catch (error) {
      this.logger.error('Failed to get order updates:', error);
      return [];
    }
  }

  async updateOrderSlaStatuses(): Promise<{ updated: number; new_breaches: SlaBreachDto[] }> {
    const result = await this.ordersService.updateSlaStatuses();
    
    // Get new breaches from the update
    const newBreaches = await this.getNewSlaBreaches();
    
    return {
      updated: result.updated,
      new_breaches: newBreaches,
    };
  }

  private calculateBreachSeverity(elapsedMinutes: number, targetMinutes: number): 'HIGH' | 'CRITICAL' {
    const breachPercentage = (elapsedMinutes / targetMinutes) * 100;
    
    if (breachPercentage >= 200) {
      return 'CRITICAL'; // 2x over target
    } else {
      return 'HIGH'; // Any breach but less than 2x
    }
  }
}