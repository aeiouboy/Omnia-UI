/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppConfigService } from 'src/core/config/services';

import {
  ObjectHelpers,
  extractCapturedFields,
  sensitiveData,
} from '../helpers';

@Injectable()
export class TracingSpanInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(TracingSpanInterceptor.name);
  constructor(private readonly appConfigService: AppConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const activeSpan = trace.getActiveSpan();
    const type = context.getType<string>();

    if (activeSpan) {
      this.attachRequestAttributes(context, activeSpan, type);
    }

    return next.handle().pipe(
      tap({
        next: response => {
          if (!activeSpan) return;

          activeSpan.setAttribute(
            'http.response.body',
            JSON.stringify(response),
          );

          void this.handleResponseMasking(activeSpan, response);

          activeSpan.end();
        },
        error: error => {
          if (!activeSpan) return;

          const { requestId } = this.extractRequestAndId(context, type);
          const errorResponse = error?.response ?? {};
          const errorMessage =
            errorResponse.message ?? error.message ?? 'Unknown error';
          const errorCode = errorResponse.errorCode ?? 'UNKNOWN_ERROR';
          const httpStatus = errorResponse.httpStatus ?? 500;

          activeSpan.setAttribute(
            'exception',
            String(error.name ?? 'UnknownException'),
          );
          activeSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: errorMessage,
          });
          activeSpan.addEvent(
            `Exception: ${error.name ?? 'UnknownException'}`,
            {
              errorCode,
              errorMessage,
              httpStatus,
              requestId,
              response: JSON.stringify(errorResponse),
            },
          );

          activeSpan.end();
        },
      }),
    );
  }

  private attachRequestAttributes(
    context: ExecutionContext,
    activeSpan: ReturnType<typeof trace.getActiveSpan>,
    type: string,
  ): void {
    const { request, requestId } = this.extractRequestAndId(context, type);
    const method = request.method ?? 'UNKNOWN';
    const path =
      ((request.route &&
      typeof request.route === 'object' &&
      'path' in request.route
        ? (request.route as { path?: string }).path
        : undefined) ||
        request.url) ??
      'UNKNOWN_PATH';
    const allowedHeaders = [
      'user-agent',
      'accept',
      'cache-control',
      'accept-encoding',
    ];
    const sanitizedHeaders = this.filterHeaders(
      (request.headers as Record<string, unknown>) || {},
      allowedHeaders,
    );

    activeSpan.setAttribute('http.headers', JSON.stringify(sanitizedHeaders));
    activeSpan.setAttribute('http.request.id', String(requestId));

    const body = request.body as { operationName?: string } | undefined;

    if (type === 'graphql' && body?.operationName) {
      activeSpan.updateName(`GraphQL ${body.operationName}`);
      activeSpan.setAttribute('graphql', true);
      activeSpan.setAttribute(
        'graphql.operation_name',
        String(body.operationName),
      );
    } else {
      activeSpan.updateName(
        `HTTP ${typeof method === 'string' ? method : 'UNKNOWN'} ${typeof path === 'string' ? path : JSON.stringify(path)}`,
      );
    }

    this.setIfExists(activeSpan, 'http.request.query', request.query);
    this.setIfExists(activeSpan, 'http.request.params', request.params);
    this.setIfExists(activeSpan, 'http.request.body', request.body);

    void this.handleMasking(activeSpan, request);
  }

  private extractRequestAndId(
    context: ExecutionContext,
    type: string,
  ): { request: Record<string, unknown>; requestId: string | null } {
    let request: Record<string, unknown> = {};
    let requestId: string | null = null;

    if (type === 'graphql') {
      const gqlCtx = context.getArgByIndex(2);

      request = gqlCtx?.req ?? {};
      requestId = request?.headers?.['x-request-id'] ?? null;
    } else {
      request = context.switchToHttp().getRequest();
      requestId = request?.headers?.['x-request-id'] ?? null;
    }

    return { request, requestId };
  }

  private filterHeaders(
    headers: Record<string, unknown>,
    allowedKeys: string[],
  ): Record<string, unknown> {
    return Object.keys(headers)
      .filter(key => allowedKeys.includes(key.toLowerCase()))
      .reduce(
        (acc, key) => {
          acc[key] = headers[key];

          return acc;
        },
        {} as Record<string, unknown>,
      );
  }

  private setIfExists(span: Span, key: string, value: unknown): void {
    if (value && !ObjectHelpers.isEmptyObject(value)) {
      span.setAttribute(key, JSON.stringify(value));
    }

    void this.handleCapturedFields(span, value);
  }

  private async handleCapturedFields(
    span: Span,
    value: unknown,
  ): Promise<void> {
    try {
      const logCapturedConfig = await this.appConfigService.get(
        'LOG_CAPTURE_REQUEST',
      );
      const capturedFields = extractCapturedFields(
        value as Record<string, any>,
        logCapturedConfig,
      );

      for (const [capturedKey, capturedValue] of Object.entries(
        capturedFields,
      )) {
        span.setAttribute(capturedKey, String(capturedValue));
      }
    } catch (error) {
      this.logger.warn('Failed to handle captured fields:', error);
    }
  }

  private async handleMasking(
    span: Span,
    request: Record<string, unknown>,
  ): Promise<void> {
    try {
      const allowedHeaders = [
        'user-agent',
        'accept',
        'cache-control',
        'accept-encoding',
      ];
      const sanitizedHeaders = this.filterHeaders(
        (request.headers as Record<string, unknown>) || {},
        allowedHeaders,
      );
      const maskedHeaders = await sensitiveData.mask(
        sanitizedHeaders,
        this.appConfigService,
      );

      span.setAttribute('http.headers', JSON.stringify(maskedHeaders));

      const maskedQuery = await sensitiveData.mask(
        request.query,
        this.appConfigService,
      );

      span.setAttribute('http.request.query', JSON.stringify(maskedQuery));

      const maskedParams = await sensitiveData.mask(
        request.params,
        this.appConfigService,
      );

      span.setAttribute('http.request.params', JSON.stringify(maskedParams));

      const maskedBody = await sensitiveData.mask(
        request.body,
        this.appConfigService,
      );

      span.setAttribute('http.request.body', JSON.stringify(maskedBody));
    } catch (error) {
      this.logger.warn('Failed to mask request data:', error);
    }
  }

  private async handleResponseMasking(
    span: Span,
    response: unknown,
  ): Promise<void> {
    try {
      const maskedResponse = await sensitiveData.mask(
        response,
        this.appConfigService,
      );

      span.setAttribute('http.response.body', JSON.stringify(maskedResponse));
    } catch (error) {
      this.logger.warn('Failed to mask response data:', error);
    }
  }
}
