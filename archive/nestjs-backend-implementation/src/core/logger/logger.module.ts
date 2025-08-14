import { DynamicModule, Global, Module } from '@nestjs/common';

import { AppConfigModule } from '../config/config.module';
import { AppConfigService } from '../config/services';

import { LoggerService } from './services/logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forRootAsync(): DynamicModule {
    return {
      module: LoggerModule,
      imports: [AppConfigModule],
      providers: [
        {
          provide: LoggerService,
          useFactory: async (
            appConfigService: AppConfigService,
          ): Promise<LoggerService> => {
            const logLevel = await appConfigService.get('LOG_LEVEL', 'info');
            const logTransport = await appConfigService.get(
              'LOG_TRANSPORT',
              'console',
            );

            return new LoggerService(appConfigService, logLevel, logTransport);
          },
          inject: [AppConfigService],
        },
      ],
      exports: [LoggerService],
    };
  }
}
