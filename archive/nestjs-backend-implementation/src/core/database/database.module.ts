import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Dialect } from 'sequelize';

import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/services';

// Import models
import { Order } from '../../models/order.model';
import { OrderItem } from '../../models/order-item.model';
import { Escalation } from '../../models/escalation.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        dialect: (await configService.get('DATABASE_DIALECT')) as Dialect,
        host: await configService.get('DATABASE_HOST'),
        port: Number(await configService.get('DATABASE_PORT')),
        username: await configService.get('DATABASE_USERNAME'),
        password: await configService.get('DATABASE_PASSWORD'),
        database: await configService.get('DATABASE_NAME'),
        schema: await configService.get('DATABASE_SCHEMA'),
        models: [Order, OrderItem, Escalation],
        autoLoadModels: false,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development',
        pool: {
          max: Number(await configService.get('DATABASE_MAX_POOL')) || 5,
        },
        define: { 
          charset: 'utf8', 
          collate: 'utf8_general_ci',
          underscored: true,
          timestamps: true,
        },
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
