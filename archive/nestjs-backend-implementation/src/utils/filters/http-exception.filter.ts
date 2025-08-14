/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { HTTP_EXCEPTION_ERROR_CODES } from 'src/common/constants';
import { ResponseDto } from 'src/common/dtos';

import { ErrorException } from '../exceptions';
import { getResponseStatus } from '../helpers';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  catch(exception: any, host: ArgumentsHost): void | GraphQLError {
    const type = host.getType<string>();
    const requestId = this.getRequestId(host, type);
    const isGraphQL = type === 'graphql';

    if (type === 'http') {
      const request = host.switchToHttp().getRequest();
      const url = request.url;

      if (url === '/health' || url.startsWith('/health?')) {
        const response = exception.getResponse() as ResponseDto<unknown>;

        response.httpStatus = 200;

        return this.handleCustomError(response, isGraphQL, requestId, host);
      }
    }

    if (exception instanceof ErrorException) {
      return this.handleCustomError(
        exception.response,
        isGraphQL,
        requestId,
        host,
      );
    }

    if (this.isResponseDtoLike(exception)) {
      return this.handleCustomError(exception, isGraphQL, requestId, host);
    }

    if (exception instanceof BadRequestException) {
      const errorResponse = exception.getResponse() as { message: string[] };
      const response = getResponseStatus(
        'ERR_BAD_REQUEST',
        null,
        errorResponse?.message || 'Validation failed.',
      );

      return this.handleCustomError(response, isGraphQL, requestId, host, 400);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorCode =
        HTTP_EXCEPTION_ERROR_CODES[exception.constructor.name] ||
        'ERR_HTTP_EXCEPTION';
      const response = getResponseStatus(errorCode);

      return this.handleCustomError(
        response,
        isGraphQL,
        requestId,
        host,
        status,
      );
    }

    const { httpStatus, ...response } = getResponseStatus(
      'ERR_INTERNAL_SERVER_ERROR',
    );

    return this.handleCustomError(
      response,
      isGraphQL,
      requestId,
      host,
      httpStatus,
    );
  }

  private handleCustomError(
    response: ResponseDto,
    isGraphQL: boolean,
    requestId: string | null,
    host: ArgumentsHost,
    statusOverride?: number,
  ): void | GraphQLError {
    if (isGraphQL) {
      return new GraphQLError(response.message, {
        extensions: {
          code: response.errorCode,
          successful: response.successful || false,
          message: response.message,
          errorCode: response.errorCode,
          httpStatus: response.httpStatus || statusOverride || 500,
          requestId,
        },
      });
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    if (!res.headersSent) {
      const httpStatus = response.httpStatus || statusOverride || 500;

      delete response.httpStatus;
      res.status(httpStatus).json({ ...response, requestId });
    }
  }

  private getRequestId(host: ArgumentsHost, type: string): string | null {
    try {
      if (type === 'graphql') {
        const gqlCtx = host.getArgByIndex(2);

        return gqlCtx?.req?.headers?.['x-request-id'] ?? null;
      }

      const req = host.switchToHttp().getRequest();

      return req?.headers?.['x-request-id'] ?? null;
    } catch {
      return null;
    }
  }

  private isResponseDtoLike(obj: any): obj is ResponseDto {
    return (
      obj &&
      typeof obj === 'object' &&
      'errorCode' in obj &&
      'httpStatus' in obj &&
      'message' in obj
    );
  }
}
