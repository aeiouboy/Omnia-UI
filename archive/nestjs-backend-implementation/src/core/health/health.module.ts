import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { AppConfigModule } from '../config/config.module';

import { HealthController } from './controllers';
import { CpuHealthIndicator, KafkaHealthIndicator } from './indicators';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule, AppConfigModule],
  providers: [CpuHealthIndicator, KafkaHealthIndicator],
})
export class HealthModule {}
