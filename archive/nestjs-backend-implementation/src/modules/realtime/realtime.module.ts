import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RealtimeGateway } from './gateways/realtime.gateway';
import { RealtimeService } from './services/realtime.service';
import { Order } from '../../models/order.model';
import { Escalation } from '../../models/escalation.model';
import { DashboardModule } from '../dashboard/dashboard.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, Escalation]),
    DashboardModule,
    OrdersModule,
  ],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeGateway, RealtimeService],
})
export class RealtimeModule {}