/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseRequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let requestId: string | null = null;

    const ctxType = context.getType<string>();

    if (ctxType === 'http') {
      const req = context.switchToHttp().getRequest();

      requestId = req.headers['x-request-id'] ?? null;
    } else if (ctxType === 'graphql') {
      const gqlCtx = context.getArgByIndex(2);

      requestId = gqlCtx?.req?.headers?.['x-request-id'] ?? null;
    }

    return next.handle().pipe(
      map(data => {
        if (typeof data === 'object' && data !== null) {
          return { ...data, requestId };
        }

        return data;
      }),
    );
  }
}
