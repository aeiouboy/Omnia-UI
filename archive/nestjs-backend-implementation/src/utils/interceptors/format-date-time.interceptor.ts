import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import dayjs from 'dayjs';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DateFormatHelper } from '../helpers';

@Injectable()
export class FormatDateTimeInterceptor implements NestInterceptor {
  constructor(private readonly dateFormatHelper: DateFormatHelper) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      switchMap(async value => {
        return await this.parseDateTime(value);
      }),
    );
  }

  private async parseDateTime(value: unknown): Promise<unknown> {
    if (value === null || value === undefined) return value;

    if (value instanceof Date) {
      return await this.dateFormatHelper.getDateTime(value);
    }

    if (typeof value === 'string') {
      const isDateLike =
        /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value);

      if (isDateLike && dayjs(value).isValid()) {
        return await this.dateFormatHelper.getDateTime(value);
      }
    }

    if (Array.isArray(value)) {
      return Promise.all(value.map(obj => this.parseDateTime(obj)));
    }

    if (typeof value === 'object' && value !== null) {
      if (value instanceof Date || value instanceof Buffer) return value;

      return this.parseDateTimeObject(value as Record<string, unknown>);
    }

    return value;
  }

  private async parseDateTimeObject(
    value: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const keys = Object.keys(value);

    for (const key of keys) {
      value[key] = await this.parseDateTime(value[key]);
    }

    return value;
  }
}
