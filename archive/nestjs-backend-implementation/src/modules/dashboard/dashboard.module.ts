import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { Order } from '../../models/order.model';
import { OrderItem } from '../../models/order-item.model';
import { Escalation } from '../../models/escalation.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, Escalation]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}