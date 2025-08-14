import { Injectable } from '@nestjs/common';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { AppConfigService } from '../../core/config/services';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DateFormatHelper {
  constructor(private readonly appConfigService: AppConfigService) {}

  public async getDate(date?: Date | string): Promise<string> {
    const timezone = await this.appConfigService.get('APP_TIMEZONE', 'UTC');
    const format = await this.appConfigService.get(
      'APP_DATE_FORMAT',
      'YYYY-MM-DD',
    );

    return dayjs(date).tz(timezone).format(format);
  }

  public async getDateTime(date?: Date | string): Promise<string> {
    const timezone = await this.appConfigService.get('APP_TIMEZONE', 'UTC');
    const format = await this.appConfigService.get(
      'APP_DATETIME_FORMAT',
      'YYYY-MM-DD HH:mm:ss',
    );

    return dayjs(date).tz(timezone).format(format);
  }

  public async getUtcOffset(): Promise<number> {
    const timezone = await this.appConfigService.get('APP_TIMEZONE', 'UTC');
    const timeSplitted = timezone.split(':').map(m => Number(m));

    return timeSplitted[0] * 60 + timeSplitted[1];
  }

  public parseDateTime(stringDateTime: string): dayjs.Dayjs {
    return dayjs(stringDateTime);
  }
}
