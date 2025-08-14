import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

import { NotificationsService } from '../services/notifications.service';
import { CreateEscalationDto, EscalationResponseDto } from '../dto/escalation.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('escalations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new escalation',
    description: 'Create and immediately process a new escalation with Teams notification'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Escalation created successfully',
    type: EscalationResponseDto
  })
  async createEscalation(
    @Body(ValidationPipe) createEscalationDto: CreateEscalationDto,
  ): Promise<EscalationResponseDto> {
    return this.notificationsService.createEscalation(createEscalationDto);
  }

  @Get('escalations')
  @ApiOperation({ 
    summary: 'Get escalations',
    description: 'Retrieve escalations with optional filtering by order ID'
  })
  @ApiQuery({ name: 'orderId', required: false, description: 'Filter by order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Escalations retrieved successfully',
    type: [EscalationResponseDto]
  })
  async getEscalations(
    @Query('orderId') orderId?: string,
  ): Promise<EscalationResponseDto[]> {
    return this.notificationsService.getEscalations(orderId);
  }

  @Post('escalations/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resolve an escalation',
    description: 'Mark an escalation as resolved'
  })
  @ApiParam({ name: 'id', description: 'Escalation UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Escalation resolved successfully',
    type: EscalationResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Escalation not found'
  })
  async resolveEscalation(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EscalationResponseDto> {
    return this.notificationsService.resolveEscalation(id);
  }
}