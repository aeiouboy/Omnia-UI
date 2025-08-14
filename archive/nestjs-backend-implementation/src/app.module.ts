import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';

import { RequestIdMiddleware } from './common/middlewares';
import {
  AppConfigModule,
  DatabaseModule,
  HealthModule,
  LoggerModule,
  TracingModule,
} from './core';
import { HttpExceptionFilter } from './utils/filters';
import { DateFormatHelper } from './utils/helpers';
import {
  ErrorLoggingInterceptor,
  FormatDateTimeInterceptor,
  ResponseInterceptor,
  ResponseRequestIdInterceptor,
  TracingSpanInterceptor,
} from './utils/interceptors';
import {
  HttpValidationPipe,
  NonPrintableCharacterSanitizerPipe,
  TrimPipe,
} from './utils/pipes';

// Import RIS OMS modules
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    HealthModule,
    TracingModule,
    LoggerModule.forRootAsync(),
    ScheduleModule.forRoot(), // Enable cron jobs for RIS OMS
    
    // RIS OMS modules
    OrdersModule,
    DashboardModule,
    NotificationsModule,
    RealtimeModule,
    
    ...(process.env.GRAPHQL_ENABLED === 'true'
      ? [
          GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            sortSchema: true,
            playground: true,
            formatError: error => {
              return {
                message:
                  typeof error.extensions?.message === 'string'
                    ? error.extensions.message
                    : error.message,
                errorCode: error.extensions?.errorCode,
                successful: error.extensions?.successful,
                httpStatus: error.extensions?.httpStatus,
                requestId: error.extensions?.requestId,
              };
            },
          }),
        ]
      : []),
  ],
  providers: [
    DateFormatHelper,
    { provide: APP_PIPE, useClass: TrimPipe },
    { provide: APP_PIPE, useClass: NonPrintableCharacterSanitizerPipe },
    { provide: APP_PIPE, useClass: HttpValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: FormatDateTimeInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TracingSpanInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ErrorLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseRequestIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
