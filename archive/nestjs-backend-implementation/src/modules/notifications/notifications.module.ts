import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';

import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { Escalation } from '../../models/escalation.model';
import { Order } from '../../models/order.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([Escalation, Order]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}