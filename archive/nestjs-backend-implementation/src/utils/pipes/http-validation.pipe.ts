import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

import { getResponseStatus } from '../helpers';

export class HttpValidationPipe implements PipeTransform {
  constructor(
    private readonly options = {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: true,
    },
  ) {}

  async transform(
    value: unknown,
    { metatype }: ArgumentMetadata,
  ): Promise<unknown> {
    if (!metatype || this.isGeneralFunction(metatype)) {
      return value;
    }

    const object: Record<string, unknown> = plainToClass(metatype, value);
    const errors = await validate(object, {
      whitelist: this.options.whitelist,
      forbidNonWhitelisted: this.options.forbidNonWhitelisted,
      stopAtFirstError: this.options.stopAtFirstError,
    });

    if (this.anyError(errors)) {
      const errorMessage = this.extractFirstError(errors);
      const response = getResponseStatus('ERR_BAD_REQUEST', null, errorMessage);

      throw new BadRequestException(response);
    }

    return value;
  }

  private isGeneralFunction(validationFunction: unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];

    return types.some(
      generalFunction => validationFunction === generalFunction,
    );
  }

  private anyError(errors: ValidationError[]): boolean {
    return errors.length > 0;
  }

  private extractFirstError(validationErrors: ValidationError[]): string {
    for (const error of validationErrors) {
      if (error.constraints) {
        return Object.values(error.constraints)[0];
      }

      if (error.children && error.children.length > 0) {
        return this.extractFirstError(error.children);
      }
    }

    return 'Validation failed';
  }
}
