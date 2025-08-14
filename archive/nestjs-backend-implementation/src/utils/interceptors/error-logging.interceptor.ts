/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { GRPC_STATUS_MAPPING } from 'src/common/constants';
import { AppConfigService } from 'src/core/config/services';
import { LoggerService } from 'src/core/logger/services';

import {
  ObjectHelpers,
  extractCapturedFields,
  sensitiveData,
} from '../helpers';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly appConfigService: AppConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(
        catchError(error =>
          from(this.processErrorLog(context, error)).pipe(
            switchMap(err => throwError(() => err)),
          ),
        ),
      );
  }

  private async processErrorLog(
    context: ExecutionContext,
    error: any,
  ): Promise<any> {
    const ctxType = context.getType<string>();
    const errorContext = this.getErrorLocation(context, error);
    const log = await this.buildBaseLog(context, error, errorContext, ctxType);

    this.logger.log(
      this.getLogLevel(error),
      log.errorMessage as string,
      errorContext,
      log,
    );

    return error;
  }

  private async buildBaseLog(
    context: ExecutionContext,
    error: any,
    errorContext: string,
    ctxType: string,
  ): Promise<Record<string, unknown>> {
    const errorName = error.name ?? 'UnknownError';
    const errorCode =
      error.response?.errorCode ??
      error.error?.code ??
      error.code ??
      error.original?.code ??
      error.parent?.code;
    const errorMessage =
      error.response?.message ??
      error.message ??
      error.original?.message ??
      error.parent?.message;
    const log: Record<string, unknown> = {
      context: errorContext,
      exception: errorName,
      code: errorCode,
      errorMessage,
      original: error.original,
      parent: error.parent,
    };

    if (ctxType === 'http') await this.attachHttpLog(context, error, log);
    if (ctxType === 'rpc')
      await this.attachRpcLog(context, error, errorCode as string, log);
    if (ctxType === 'graphql') await this.attachGraphQLLog(context, log);

    if (error.stack && this.getLogLevel(error) === 'error') {
      log.stack = error.stack.split('\n').slice(1).join('\n');
    }

    return log;
  }

  private async attachHttpLog(
    context: ExecutionContext,
    error: any,
    log: Record<string, unknown>,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] as string;
    const host = request.headers.host ?? '';
    const [query, params, body] = await Promise.all([
      this.resolveAllNestedPromises(await this.sanitizeData(request.query)),
      this.resolveAllNestedPromises(await this.sanitizeData(request.params)),
      this.resolveAllNestedPromises(await this.sanitizeData(request.body)),
    ]);
    const httpLog: Record<string, unknown> = {
      request: {
        host,
        method: request.method,
        path: request.url,
        headers: await this.sanitizeHeaders(
          request.headers as Record<string, unknown>,
        ),
      },
      response: {
        status: error.response?.httpStatus ?? 500,
      },
    };
    const logCapturedConfig = await this.appConfigService.get(
      'LOG_CAPTURE_REQUEST',
    );

    if (!ObjectHelpers.isEmptyObject(query)) {
      httpLog.request['query'] = JSON.stringify(query);

      const capturedQuery = extractCapturedFields(
        query as Record<string, any>,
        logCapturedConfig,
      );

      Object.entries(capturedQuery).forEach(([key, value]) => {
        log[key] = value;
      });
    }

    if (!ObjectHelpers.isEmptyObject(params)) {
      httpLog.request['param'] = JSON.stringify(params);

      const capturedParam = extractCapturedFields(
        params as Record<string, any>,
        logCapturedConfig,
      );

      Object.entries(capturedParam).forEach(([key, value]) => {
        log[key] = value;
      });
    }

    if (!ObjectHelpers.isEmptyObject(body)) {
      httpLog.request['body'] = JSON.stringify(body);

      const capturedBody = extractCapturedFields(
        body as Record<string, any>,
        logCapturedConfig,
      );

      Object.entries(capturedBody).forEach(([key, value]) => {
        log[key] = value;
      });
    }

    log.protocol = 'http';
    log.request_id = requestId;
    log.http = httpLog;
  }

  private async attachRpcLog(
    context: ExecutionContext,
    error: any,
    errorCode: string,
    log: Record<string, unknown>,
  ): Promise<void> {
    const rpcStatus = GRPC_STATUS_MAPPING[errorCode] ?? 'UNKNOWN';
    const params = await this.resolveAllNestedPromises(
      await this.sanitizeData(context.switchToRpc().getData()),
    );
    const rpcLog: Record<string, unknown> = {
      request: {
        method: (log.context as string).split('.').pop(),
      },
      response: {
        status: rpcStatus,
      },
    };
    const logCapturedConfig = await this.appConfigService.get(
      'LOG_CAPTURE_REQUEST',
    );

    if (!ObjectHelpers.isEmptyObject(params)) {
      rpcLog.request['param'] = JSON.stringify(params);

      const capturedParam = extractCapturedFields(
        params as Record<string, any>,
        logCapturedConfig,
      );

      Object.entries(capturedParam).forEach(([key, value]) => {
        log[key] = value;
      });
    }

    if (rpcStatus === 'INVALID_ARGUMENT') {
      log.name = 'BadRequestException';
      error.name = 'ClientRequestException';
    }

    log.protocol = 'rpc';
    log.rpc = rpcLog;
  }

  private async attachGraphQLLog(
    context: ExecutionContext,
    log: Record<string, unknown>,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const host = request.headers.host ?? '';
    const graphqlContext = context.getArgByIndex(2);
    const graphqlInfo = context.getArgByIndex(3);
    const graphqlLog: Record<string, unknown> = {
      request: {
        host,
        method: graphqlContext.req.method,
        path: graphqlContext.req.url,
        headers: await this.sanitizeHeaders(
          graphqlContext.req.headers as Record<string, unknown>,
        ),
        operation: graphqlContext.req.body?.operationName,
        query: graphqlContext.req.body?.query,
        field: graphqlInfo?.fieldName,
      },
    };
    const logCapturedConfig = await this.appConfigService.get(
      'LOG_CAPTURE_REQUEST',
    );

    if (!ObjectHelpers.isEmptyObject(graphqlContext?.variables)) {
      graphqlLog.request['variables'] = JSON.stringify(
        graphqlContext?.variables,
      );

      const capturedVariables = extractCapturedFields(
        graphqlContext?.variables as Record<string, any>,
        logCapturedConfig,
      );

      Object.entries(capturedVariables).forEach(([key, value]) => {
        log[key] = value;
      });
    }

    log.protocol = 'http-grapphql';
    log.graphql = graphqlLog;
    log.request_id = graphqlContext?.req?.headers?.['x-request-id'];
  }

  private getErrorLocation(context: ExecutionContext, error: unknown): string {
    const stackLine =
      error instanceof Error && error.stack
        ? error.stack
            .split('\n')
            .find(line => line.includes('.ts') && line.includes('at'))
        : null;

    if (stackLine) {
      const match =
        /at (.*?) \\((.*?):(\\d+):(\\d+)\\)/.exec(stackLine) ||
        /at (\\w+)\\.(\\w+)/.exec(stackLine);

      if (match) return match[1];
    }

    const className = context.getClass().name;
    const handler = context.getHandler();
    const prototype = context.getClass().prototype;
    const methodName =
      Object.getOwnPropertyNames(prototype).find(
        name => prototype[name] === handler,
      ) || (typeof handler === 'function' ? handler.name : 'UnknownMethod');

    return `${className}.${methodName}`;
  }

  private getLogLevel(error: any): 'warn' | 'error' {
    return error.name === 'ClientRequestException' ||
      error instanceof BadRequestException
      ? 'warn'
      : 'error';
  }

  private async sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const allowed = [
      'user-agent',
      'accept',
      'content-type',
      'x-request-id',
      'cache-control',
      'accept-encoding',
      'authorization',
      'x-api-key',
      'api-key',
      'organization',
      'ocp-apim-subscription-key',
      'basicauth',
    ];
    const filtered = Object.entries(headers)
      .filter(([key]) => allowed.includes(key.toLowerCase()))
      .reduce<Record<string, unknown>>((acc, [key, value]) => {
        acc[key] = value;

        return acc;
      }, {});

    return this.sanitizeData(filtered);
  }

  private async sanitizeData<T>(data: T): Promise<T> {
    if (!data || typeof data !== 'object') return data;

    return (await sensitiveData.mask(data, this.appConfigService)) as T;
  }

  private async resolveAllNestedPromises<T>(obj: T): Promise<T> {
    if (obj instanceof Promise) return this.resolveAllNestedPromises(await obj);

    if (Array.isArray(obj)) {
      return Promise.all(
        obj.map(value => this.resolveAllNestedPromises(value)),
      ) as Promise<T>;
    }

    if (typeof obj === 'object' && obj !== null) {
      const entries = await Promise.all(
        Object.entries(obj).map(async ([key, value]) => [
          key,
          await this.resolveAllNestedPromises(value),
        ]),
      );

      return Object.fromEntries(entries) as T;
    }

    return obj;
  }
}
