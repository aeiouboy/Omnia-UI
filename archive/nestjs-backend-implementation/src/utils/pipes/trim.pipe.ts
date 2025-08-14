import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<unknown> {
  transform(value: unknown): unknown {
    return this.trim(value);
  }

  private trim(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(each => this.trim(each));

    if (typeof value === 'object' && value !== null) {
      if (value instanceof Date || value instanceof Buffer) return value;

      return this.trimObject(value as Record<string, unknown>);
    }

    return value;
  }

  private trimObject(value: Record<string, unknown>): Record<string, unknown> {
    Object.keys(value).forEach(key => {
      value[key] = this.trim(value[key]);
    });

    return value;
  }
}
