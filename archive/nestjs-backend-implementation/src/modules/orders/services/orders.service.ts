import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions, OrderItem as SequelizeOrderItem } from 'sequelize';
import { Order } from '../../../models/order.model';
import { OrderItem } from '../../../models/order-item.model';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderResponseDto, PaginatedOrdersResponseDto } from '../dto/order-response.dto';
import { OrderCountsResponseDto } from '../dto/order-counts.dto';

@Injectable()
export class OrdersService {
  private readonly CACHE_TTL = 30000; // 30 seconds
  private countsCache: { data: OrderCountsResponseDto; timestamp: number } | null = null;

  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
  ) {}

  async findAll(query: OrderQueryDto): Promise<PaginatedOrdersResponseDto> {
    const { page = 1, pageSize = 20, sortBy = 'created_at', sortOrder = 'DESC' } = query;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions: WhereOptions = {};

    if (query.startDate) {
      whereConditions.order_date = {
        ...whereConditions.order_date,
        [Op.gte]: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      whereConditions.order_date = {
        ...whereConditions.order_date,
        [Op.lte]: new Date(query.endDate),
      };
    }

    if (query.customerId) {
      whereConditions.customer_id = query.customerId;
    }

    if (query.customerEmail) {
      whereConditions.customer_email = query.customerEmail;
    }

    if (query.status) {
      whereConditions.status = query.status;
    }

    if (query.channel) {
      whereConditions.channel = query.channel;
    }

    if (query.businessUnit) {
      whereConditions.business_unit = query.businessUnit;
    }

    if (query.slaStatus) {
      whereConditions.sla_status = query.slaStatus;
    }

    if (query.priority) {
      whereConditions.priority = query.priority;
    }

    if (query.search) {
      whereConditions[Op.or] = [
        { order_no: { [Op.iLike]: `%${query.search}%` } },
        { customer_name: { [Op.iLike]: `%${query.search}%` } },
        { customer_email: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    // Execute query with count
    const { count, rows } = await this.orderModel.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true, // For proper counting with joins
    });

    // Transform to response DTOs
    const data = rows.map(order => this.transformToResponseDto(order));

    const totalPages = Math.ceil(count / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: query,
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderModel.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.transformToResponseDto(order);
  }

  async getOrderCounts(): Promise<OrderCountsResponseDto> {
    // Check cache first
    if (this.countsCache && Date.now() - this.countsCache.timestamp < this.CACHE_TTL) {
      return this.countsCache.data;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parallel queries for performance
    const [
      breachCount,
      nearBreachCount,
      submittedCount,
      onHoldCount,
      totalProcessing,
      todayOrders,
      urgentOrders,
      totalOrders,
      avgProcessingTime,
      fulfilledOrders,
    ] = await Promise.all([
      this.orderModel.count({ where: { sla_status: 'BREACH' } }),
      this.orderModel.count({ where: { sla_status: 'NEAR_BREACH' } }),
      this.orderModel.count({ where: { status: 'PENDING' } }),
      this.orderModel.count({ where: { status: 'PROCESSING', priority: 'HIGH' } }),
      this.orderModel.count({ where: { status: 'PROCESSING' } }),
      this.orderModel.count({ where: { order_date: { [Op.gte]: todayStart } } }),
      this.orderModel.count({ where: { priority: 'URGENT' } }),
      this.orderModel.count(),
      this.calculateAverageProcessingTime(),
      this.orderModel.count({ where: { status: 'DELIVERED' } }),
    ]);

    const complianceRate = totalOrders > 0 ? ((totalOrders - breachCount) / totalOrders) * 100 : 100;
    const fulfillmentRate = totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0;

    const counts: OrderCountsResponseDto = {
      breach_count: breachCount,
      near_breach_count: nearBreachCount,
      submitted_count: submittedCount,
      on_hold_count: onHoldCount,
      total_processing: totalProcessing,
      today_orders: todayOrders,
      urgent_orders: urgentOrders,
      compliance_rate: Math.round(complianceRate * 100) / 100,
      avg_processing_time: avgProcessingTime,
      fulfillment_rate: Math.round(fulfillmentRate * 100) / 100,
      timestamp: now,
      cache_ttl_seconds: this.CACHE_TTL / 1000,
    };

    // Update cache
    this.countsCache = {
      data: counts,
      timestamp: Date.now(),
    };

    return counts;
  }

  async updateSlaStatuses(): Promise<{ updated: number }> {
    const orders = await this.orderModel.findAll({
      where: {
        status: {
          [Op.in]: ['PENDING', 'PROCESSING'],
        },
      },
    });

    let updatedCount = 0;

    for (const order of orders) {
      const now = Date.now();
      const orderTime = new Date(order.order_date).getTime();
      const elapsedMinutes = Math.floor((now - orderTime) / 1000); // Convert to seconds like current system
      const targetMinutes = order.sla_target_minutes;
      const remainingTime = targetMinutes - elapsedMinutes;
      const criticalThreshold = targetMinutes * 0.2; // 20% threshold

      let newStatus: 'BREACH' | 'NEAR_BREACH' | 'COMPLIANT';

      if (elapsedMinutes > targetMinutes) {
        newStatus = 'BREACH';
      } else if (remainingTime <= criticalThreshold && remainingTime > 0) {
        newStatus = 'NEAR_BREACH';
      } else {
        newStatus = 'COMPLIANT';
      }

      if (order.sla_status !== newStatus || order.sla_elapsed_minutes !== elapsedMinutes) {
        await order.update({
          sla_status: newStatus,
          sla_elapsed_minutes: elapsedMinutes,
        });
        updatedCount++;
      }
    }

    // Invalidate cache after updates
    this.countsCache = null;

    return { updated: updatedCount };
  }

  private async calculateAverageProcessingTime(): Promise<number> {
    const deliveredOrders = await this.orderModel.findAll({
      where: { status: 'DELIVERED' },
      attributes: ['order_date', 'updated_at'],
      limit: 1000, // Sample recent orders for performance
      order: [['updated_at', 'DESC']],
    });

    if (deliveredOrders.length === 0) return 0;

    const totalProcessingTime = deliveredOrders.reduce((sum, order) => {
      const orderTime = new Date(order.order_date).getTime();
      const deliveryTime = new Date(order.updated_at).getTime();
      return sum + (deliveryTime - orderTime);
    }, 0);

    return Math.round(totalProcessingTime / deliveredOrders.length / 60000); // Convert to minutes
  }

  private transformToResponseDto(order: Order): OrderResponseDto {
    const now = Date.now();
    const orderTime = new Date(order.order_date).getTime();
    const elapsedMinutes = Math.floor((now - orderTime) / 1000); // Keep in seconds for consistency
    const remainingMinutes = Math.max(0, order.sla_target_minutes - elapsedMinutes);
    const breachPercentage = order.sla_target_minutes > 0 
      ? Math.round((elapsedMinutes / order.sla_target_minutes) * 100) 
      : 0;

    return {
      id: order.id,
      order_no: order.order_no,
      customer: {
        id: order.customer_id,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      order_date: order.order_date,
      status: order.status,
      channel: order.channel,
      business_unit: order.business_unit,
      order_type: order.order_type,
      items: order.items?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        product_details: {
          description: item.product_description || '',
          category: item.product_category || '',
          brand: item.product_brand || '',
        },
      })) || [],
      total_amount: order.total_amount,
      shipping_address: {
        street: order.shipping_street,
        city: order.shipping_city,
        state: order.shipping_state,
        postal_code: order.shipping_postal_code,
        country: order.shipping_country,
      },
      payment_info: {
        method: order.payment_method,
        status: order.payment_status,
        transaction_id: order.payment_transaction_id,
      },
      sla_info: {
        target_minutes: order.sla_target_minutes,
        elapsed_minutes: order.sla_elapsed_minutes,
        status: order.sla_status,
        remaining_minutes: remainingMinutes,
        breach_percentage: breachPercentage,
      },
      metadata: {
        created_at: order.created_at,
        updated_at: order.updated_at,
        priority: order.priority,
        store_name: order.store_name,
      },
    };
  }
}