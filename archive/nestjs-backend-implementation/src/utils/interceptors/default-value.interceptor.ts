import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';

@Injectable()
export class DefaultValueInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const setDefaultValues = (obj: Record<string, unknown>): void => {
      if (!obj || typeof obj !== 'object') {
        return;
      }

      if (
        obj.createdBy === null ||
        obj.createdBy === undefined ||
        obj.createdBy === ''
      ) {
        obj.createdBy = 'system';
      }

      if (
        obj.updatedBy === null ||
        obj.updatedBy === undefined ||
        obj.updatedBy === ''
      ) {
        obj.updatedBy = 'system';
      }

      for (const key in obj) {
        if (Object.hasOwn(obj, key) && typeof obj[key] === 'object') {
          setDefaultValues(obj[key] as Record<string, unknown>);
        }
      }
    };

    if (
      request?.body &&
      typeof request?.body === 'object' &&
      !Array.isArray(request.body)
    ) {
      setDefaultValues(request?.body as Record<string, unknown>);
    }

    return next.handle();
  }
}
