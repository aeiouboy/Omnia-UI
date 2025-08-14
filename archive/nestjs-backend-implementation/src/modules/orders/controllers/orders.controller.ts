import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

import { OrdersService } from '../services/orders.service';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderResponseDto, PaginatedOrdersResponseDto } from '../dto/order-response.dto';
import { OrderCountsResponseDto } from '../dto/order-counts.dto';
import { ResponseDto } from '../../../common/dtos/response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get orders with filtering and pagination',
    description: 'Retrieve orders with advanced filtering, searching, sorting, and pagination capabilities'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully',
    type: PaginatedOrdersResponseDto
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC/DESC)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter orders from date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter orders to date (ISO string)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiQuery({ name: 'slaStatus', required: false, description: 'Filter by SLA status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority level' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in order number, customer name, or email' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: OrderQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.findAll(query);
  }

  @Get('stats/counts')
  @ApiOperation({ 
    summary: 'Get real-time order counts and metrics',
    description: 'Retrieve cached order counts for dashboard KPIs with 30-second cache TTL'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order counts retrieved successfully',
    type: OrderCountsResponseDto
  })
  async getOrderCounts(): Promise<OrderCountsResponseDto> {
    return this.ordersService.getOrderCounts();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get order by ID',
    description: 'Retrieve a specific order with all related items and details'
  })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Order retrieved successfully',
    type: OrderResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Order not found'
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Post('sla/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update SLA statuses for all active orders',
    description: 'Recalculate and update SLA statuses for pending and processing orders'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'SLA statuses updated successfully',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', description: 'Number of orders updated' }
      }
    }
  })
  async updateSlaStatuses(): Promise<{ updated: number }> {
    return this.ordersService.updateSlaStatuses();
  }
}