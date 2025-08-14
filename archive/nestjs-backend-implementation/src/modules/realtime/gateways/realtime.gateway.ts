import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RealtimeService } from '../services/realtime.service';
import { 
  RealtimeUpdateDto, 
  ClientSubscriptionDto,
  OrderUpdateDto,
  SlaBreachDto,
  DashboardRefreshDto,
  SystemAlertDto 
} from '../dto/realtime.dto';

interface ExtendedSocket extends Socket {
  subscriptions?: string[];
  clientId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients = new Map<string, ExtendedSocket>();
  private clientSubscriptions = new Map<string, string[]>();

  constructor(private readonly realtimeService: RealtimeService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: ExtendedSocket) {
    const clientId = this.generateClientId();
    client.clientId = clientId;
    client.subscriptions = ['all']; // Default subscription
    
    this.connectedClients.set(clientId, client);
    this.clientSubscriptions.set(clientId, ['all']);
    
    this.logger.log(`Client connected: ${clientId}`);
    
    // Send initial connection confirmation
    client.emit('connected', {
      clientId,
      timestamp: new Date(),
      subscriptions: client.subscriptions,
    });

    // Send current dashboard summary on connection
    this.realtimeService.getDashboardSummary().then(summary => {
      client.emit('dashboard_initial', summary);
    }).catch(error => {
      this.logger.error('Failed to send initial dashboard data:', error);
    });
  }

  handleDisconnect(client: ExtendedSocket) {
    if (client.clientId) {
      this.connectedClients.delete(client.clientId);
      this.clientSubscriptions.delete(client.clientId);
      this.logger.log(`Client disconnected: ${client.clientId}`);
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() subscriptionData: { types: string[]; filters?: any },
  ) {
    if (!client.clientId) return;

    client.subscriptions = subscriptionData.types;
    this.clientSubscriptions.set(client.clientId, subscriptionData.types);

    this.logger.log(`Client ${client.clientId} subscribed to: ${subscriptionData.types.join(', ')}`);

    client.emit('subscription_updated', {
      subscriptions: client.subscriptions,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() data: { types: string[] },
  ) {
    if (!client.clientId || !client.subscriptions) return;

    client.subscriptions = client.subscriptions.filter(
      sub => !data.types.includes(sub)
    );
    
    this.clientSubscriptions.set(client.clientId, client.subscriptions);

    client.emit('subscription_updated', {
      subscriptions: client.subscriptions,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }

  // Broadcast methods for services to use
  broadcastOrderUpdate(orderUpdate: OrderUpdateDto) {
    const update: RealtimeUpdateDto = {
      type: 'ORDER_UPDATE',
      payload: orderUpdate,
      timestamp: new Date(),
      source: 'orders-service',
    };

    this.broadcastToSubscribers('orders', update);
    this.broadcastToSubscribers('all', update);
  }

  broadcastSlaBreachAlert(slaBreachAlert: SlaBreachDto) {
    const update: RealtimeUpdateDto = {
      type: 'SLA_BREACH',
      payload: slaBreachAlert,
      timestamp: new Date(),
      source: 'sla-monitor',
    };

    this.broadcastToSubscribers('alerts', update);
    this.broadcastToSubscribers('all', update);
    
    this.logger.warn(`SLA Breach Alert broadcasted for order ${slaBreachAlert.order_no}`);
  }

  broadcastDashboardRefresh(dashboardData: DashboardRefreshDto) {
    const update: RealtimeUpdateDto = {
      type: 'DASHBOARD_REFRESH',
      payload: dashboardData,
      timestamp: new Date(),
      source: 'dashboard-service',
    };

    this.broadcastToSubscribers('dashboard', update);
    this.broadcastToSubscribers('all', update);
  }

  broadcastSystemAlert(systemAlert: SystemAlertDto) {
    const update: RealtimeUpdateDto = {
      type: 'SYSTEM_ALERT',
      payload: systemAlert,
      timestamp: new Date(),
      source: 'system-monitor',
    };

    this.broadcastToSubscribers('alerts', update);
    this.broadcastToSubscribers('all', update);

    this.logger.error(`System Alert broadcasted: ${systemAlert.message}`);
  }

  // Periodic health check and dashboard refresh
  @Cron(CronExpression.EVERY_30_SECONDS)
  async sendDashboardUpdates() {
    if (this.connectedClients.size === 0) return;

    try {
      const dashboardSummary = await this.realtimeService.getDashboardSummary();
      
      const update: RealtimeUpdateDto = {
        type: 'DASHBOARD_REFRESH',
        payload: {
          affected_kpis: ['all'],
          summary: dashboardSummary,
        },
        timestamp: new Date(),
        source: 'scheduled-refresh',
      };

      this.broadcastToSubscribers('dashboard', update);
      this.broadcastToSubscribers('all', update);

    } catch (error) {
      this.logger.error('Failed to send scheduled dashboard update:', error);
    }
  }

  // Monitor for SLA breaches every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async checkForSlaBreaches() {
    if (this.connectedClients.size === 0) return;

    try {
      const slaBreaches = await this.realtimeService.getNewSlaBreaches();
      
      for (const breach of slaBreaches) {
        this.broadcastSlaBreachAlert(breach);
      }

    } catch (error) {
      this.logger.error('Failed to check for SLA breaches:', error);
    }
  }

  // Send connection statistics every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  logConnectionStats() {
    const stats = {
      total_connections: this.connectedClients.size,
      subscriptions_breakdown: {},
    };

    // Count subscriptions
    this.clientSubscriptions.forEach((subscriptions) => {
      subscriptions.forEach((sub) => {
        stats.subscriptions_breakdown[sub] = 
          (stats.subscriptions_breakdown[sub] || 0) + 1;
      });
    });

    this.logger.log('Connection stats:', stats);
  }

  private broadcastToSubscribers(subscriptionType: string, data: RealtimeUpdateDto) {
    let sentCount = 0;

    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.includes(subscriptionType)) {
        const client = this.connectedClients.get(clientId);
        if (client && client.connected) {
          client.emit('realtime_update', data);
          sentCount++;
        }
      }
    });

    if (sentCount > 0) {
      this.logger.debug(`Broadcasted ${data.type} to ${sentCount} clients subscribed to ${subscriptionType}`);
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility method for external services to get connection count
  getConnectionCount(): number {
    return this.connectedClients.size;
  }

  // Utility method to check if any clients are subscribed to a type
  hasSubscribers(subscriptionType: string): boolean {
    return Array.from(this.clientSubscriptions.values()).some(
      subscriptions => subscriptions.includes(subscriptionType)
    );
  }
}