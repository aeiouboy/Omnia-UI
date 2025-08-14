import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { DashboardService } from '../services/dashboard.service';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ 
    summary: 'Get dashboard summary with KPIs and charts',
    description: 'Retrieve comprehensive dashboard data including KPIs, charts, recent orders, and alerts with 30-second cache TTL'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard summary retrieved successfully',
    type: DashboardSummaryDto
  })
  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getDashboardSummary();
  }
}