import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import axios, { AxiosError } from 'axios';

import { Escalation } from '../../../models/escalation.model';
import { Order } from '../../../models/order.model';
import { CreateEscalationDto, EscalationResponseDto, TeamsMessageDto } from '../dto/escalation.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly DEFAULT_WEBHOOK_URL: string;
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAY = 5000; // 5 seconds

  constructor(
    @InjectModel(Escalation)
    private escalationModel: typeof Escalation,
    @InjectModel(Order)
    private orderModel: typeof Order,
    private configService: ConfigService,
  ) {
    this.DEFAULT_WEBHOOK_URL = this.configService.get<string>('MS_TEAMS_WEBHOOK_URL') || '';
  }

  async createEscalation(createEscalationDto: CreateEscalationDto): Promise<EscalationResponseDto> {
    // Check if escalation already exists for this order and alert type
    const existingEscalation = await this.escalationModel.findOne({
      where: {
        order_id: createEscalationDto.order_id,
        alert_type: createEscalationDto.alert_type,
        status: { [Op.in]: ['PENDING', 'SENT'] },
      },
    });

    if (existingEscalation) {
      this.logger.warn(
        `Escalation already exists for order ${createEscalationDto.order_id} with type ${createEscalationDto.alert_type}`,
      );
      return this.transformToResponseDto(existingEscalation);
    }

    // Create new escalation
    const escalation = await this.escalationModel.create({
      ...createEscalationDto,
      teams_webhook_url: createEscalationDto.teams_webhook_url || this.DEFAULT_WEBHOOK_URL,
    });

    // Send notification immediately if webhook URL is available
    if (escalation.teams_webhook_url) {
      this.processEscalationNotification(escalation.id).catch(error => {
        this.logger.error(`Failed to send immediate notification for escalation ${escalation.id}:`, error);
      });
    }

    return this.transformToResponseDto(escalation);
  }

  async getEscalations(orderId?: string): Promise<EscalationResponseDto[]> {
    const whereCondition = orderId ? { order_id: orderId } : {};
    
    const escalations = await this.escalationModel.findAll({
      where: whereCondition,
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    return escalations.map(escalation => this.transformToResponseDto(escalation));
  }

  async resolveEscalation(id: string): Promise<EscalationResponseDto> {
    const escalation = await this.escalationModel.findByPk(id);
    
    if (!escalation) {
      throw new HttpException(`Escalation with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    await escalation.update({
      status: 'RESOLVED',
      resolved_at: new Date(),
    });

    return this.transformToResponseDto(escalation);
  }

  // Cron job to process pending notifications every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingNotifications(): Promise<void> {
    this.logger.debug('Processing pending notifications...');

    const pendingEscalations = await this.escalationModel.findAll({
      where: {
        status: 'PENDING',
        retry_count: { [Op.lt]: this.MAX_RETRY_COUNT },
      },
      limit: 10, // Process in batches
    });

    if (pendingEscalations.length === 0) {
      return;
    }

    this.logger.log(`Processing ${pendingEscalations.length} pending notifications`);

    const promises = pendingEscalations.map(escalation => 
      this.processEscalationNotification(escalation.id)
    );

    await Promise.allSettled(promises);
  }

  // Cron job to retry failed notifications every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedNotifications(): Promise<void> {
    const failedEscalations = await this.escalationModel.findAll({
      where: {
        status: 'FAILED',
        retry_count: { [Op.lt]: this.MAX_RETRY_COUNT },
        updated_at: {
          [Op.lt]: new Date(Date.now() - this.RETRY_DELAY),
        },
      },
      limit: 5, // Retry in smaller batches
    });

    if (failedEscalations.length === 0) {
      return;
    }

    this.logger.log(`Retrying ${failedEscalations.length} failed notifications`);

    for (const escalation of failedEscalations) {
      await this.processEscalationNotification(escalation.id);
    }
  }

  private async processEscalationNotification(escalationId: string): Promise<void> {
    const escalation = await this.escalationModel.findByPk(escalationId, {
      include: [Order],
    });

    if (!escalation) {
      this.logger.error(`Escalation ${escalationId} not found`);
      return;
    }

    if (!escalation.teams_webhook_url) {
      this.logger.error(`No webhook URL configured for escalation ${escalationId}`);
      await escalation.update({ status: 'FAILED' });
      return;
    }

    try {
      const teamsMessage = await this.createTeamsMessage(escalation);
      
      await axios.post(escalation.teams_webhook_url, teamsMessage, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await escalation.update({
        status: 'SENT',
        notification_sent_at: new Date(),
      });

      this.logger.log(`Successfully sent notification for escalation ${escalationId}`);

    } catch (error) {
      this.logger.error(`Failed to send notification for escalation ${escalationId}:`, error);

      const newRetryCount = escalation.retry_count + 1;
      const status = newRetryCount >= this.MAX_RETRY_COUNT ? 'FAILED' : 'PENDING';

      await escalation.update({
        status,
        retry_count: newRetryCount,
      });

      if (status === 'FAILED') {
        this.logger.error(`Escalation ${escalationId} marked as failed after ${this.MAX_RETRY_COUNT} attempts`);
      }
    }
  }

  private async createTeamsMessage(escalation: Escalation): Promise<TeamsMessageDto> {
    // Get order details if available
    const order = await this.orderModel.findByPk(escalation.order_id);

    const color = this.getColorBySeverity(escalation.severity);
    const title = this.getTitleByAlertType(escalation.alert_type);

    const facts = [
      { name: 'Alert Type', value: escalation.alert_type.replace('_', ' ') },
      { name: 'Severity', value: escalation.severity },
      { name: 'Order ID', value: escalation.order_id },
    ];

    if (order) {
      facts.push(
        { name: 'Order Number', value: order.order_no },
        { name: 'Customer', value: order.customer_name },
        { name: 'Status', value: order.status },
        { name: 'SLA Status', value: order.sla_status },
        { name: 'Elapsed Time', value: `${Math.floor(order.sla_elapsed_minutes / 60)}h ${order.sla_elapsed_minutes % 60}m` },
      );
    }

    return {
      title,
      summary: escalation.message,
      color,
      sections: [
        {
          activityTitle: escalation.alert_type.replace('_', ' '),
          activitySubtitle: escalation.message,
          facts,
          markdown: true,
        },
      ],
    };
  }

  private getColorBySeverity(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'FF0000'; // Red
      case 'HIGH':
        return 'FF8C00'; // Orange
      case 'MEDIUM':
        return 'FFD700'; // Yellow
      case 'LOW':
        return '32CD32'; // Green
      default:
        return '808080'; // Gray
    }
  }

  private getTitleByAlertType(alertType: string): string {
    switch (alertType) {
      case 'SLA_BREACH':
        return '🚨 SLA Breach Alert';
      case 'APPROACHING_SLA':
        return '⚠️ Approaching SLA Deadline';
      case 'CRITICAL_ERROR':
        return '💥 Critical System Error';
      case 'SYSTEM_ALERT':
        return '📢 System Alert';
      default:
        return '🔔 Notification';
    }
  }

  private transformToResponseDto(escalation: Escalation): EscalationResponseDto {
    return {
      id: escalation.id,
      order_id: escalation.order_id,
      alert_type: escalation.alert_type,
      severity: escalation.severity,
      status: escalation.status,
      message: escalation.message,
      teams_webhook_url: escalation.teams_webhook_url,
      notification_sent_at: escalation.notification_sent_at,
      resolved_at: escalation.resolved_at,
      retry_count: escalation.retry_count,
      metadata: escalation.metadata,
      created_at: escalation.created_at,
      updated_at: escalation.updated_at,
    };
  }
}