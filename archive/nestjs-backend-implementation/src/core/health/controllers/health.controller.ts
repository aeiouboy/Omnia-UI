/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Get, Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

import { KafkaConfig } from 'kafkajs';

import { AppConfigService } from 'src/core/config/services';

import { CpuHealthIndicator, KafkaHealthIndicator } from '../indicators';

@Injectable()
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: AppConfigService,
    private readonly health: HealthCheckService,
    private readonly sequelize: SequelizeHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly cpu: CpuHealthIndicator,
    private readonly kafka: KafkaHealthIndicator,
  ) {}

  private readonly memoryLimitMB = Number(process.env.MEMORY_LIMIT) || 512;
  private readonly heapLimit = this.memoryLimitMB * 0.8 * 1024 * 1024;
  private readonly rssLimit = this.memoryLimitMB * 0.9 * 1024 * 1024;
  private readonly cpuLimit =
    Number(process.env.APP_CPU_LIMIT_PERCENTAGE) || 90;

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult> {
    const healthChecks = [
      (): Promise<HealthIndicatorResult> =>
        this.sequelize.pingCheck('database'),
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_heap', this.heapLimit),
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_rss', this.rssLimit),
      async (): Promise<HealthIndicatorResult> =>
        this.cpu.checkCpuUsage('cpu', this.cpuLimit),
    ];

    if ((await this.configService.get('KAFKA_ENABLED', 'false')) === 'true') {
      healthChecks.push(async (): Promise<HealthIndicatorResult> => {
        const brokers = [await this.configService.get('KAFKA_BROKER')];
        const groupId = await this.configService.get('KAFKA_GROUP_ID');
        const clientId = await this.configService.get('KAFKA_CLIENT_ID');
        const ssl = await this.configService.get('KAFKA_SSL_ENABLED');
        const kafkaOptions: KafkaConfig = {
          clientId,
          brokers,
        };

        if (ssl === 'true') {
          const mechanism = await this.configService.get(
            'KAFKA_SASL_MECHANISM',
          );
          const username = await this.configService.get('KAFKA_USERNAME');
          const password = await this.configService.get('KAFKA_PASSWORD');

          (kafkaOptions as any).ssl = true;
          (kafkaOptions as any).sasl = {
            mechanism,
            username,
            password,
          };
        }

        (kafkaOptions as any).groupId = groupId;

        return this.kafka.check('kafka', kafkaOptions);
      });
    }

    return this.health.check(healthChecks);
  }
}
