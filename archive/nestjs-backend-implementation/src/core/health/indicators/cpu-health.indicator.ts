import * as os from 'os';

import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class CpuHealthIndicator {
  async checkCpuUsage(
    key: string,
    thresholdPercent: number,
  ): Promise<HealthIndicatorResult> {
    const cpuUsagePercent = await this.getCpuUsage();
    const status = cpuUsagePercent < thresholdPercent ? 'up' : 'down';

    return {
      [key]: {
        status,
        cpuUsage: cpuUsagePercent,
        threshold: thresholdPercent,
        unit: 'percent',
      },
    };
  }

  private getCpuUsage(): Promise<number> {
    const start = this.getCpuAverage();

    return new Promise(resolve => {
      setTimeout(() => {
        const end = this.getCpuAverage();
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;
        const usage = 100 - Math.floor((idleDiff / totalDiff) * 100);

        resolve(usage);
      }, 500);
    });
  }

  private getCpuAverage(): { idle: number; total: number } {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        total += cpu.times[type];
      }

      idle += cpu.times.idle;
    }

    return { idle, total };
  }
}
