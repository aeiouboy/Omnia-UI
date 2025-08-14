import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class NonPrintableCharacterSanitizerPipe
  implements PipeTransform<unknown>
{
  transform(value: unknown): unknown {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') return this.sanitizeString(value);
    if (Array.isArray(value)) return value.map(each => this.sanitize(each));

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value as Record<string, unknown>);
    }

    return value;
  }

  private sanitizeString(value: string): string {
    return value.replace(
      /[\u007F-\u009F\u00A0\u200B-\u200F\u2028-\u202F\u205F\u3000\uFEFF]/g,
      '',
    );
  }

  private sanitizeObject(
    value: Record<string, unknown>,
  ): Record<string, unknown> {
    Object.keys(value).forEach(key => {
      value[key] = this.sanitize(value[key]);
    });

    return value;
  }
}
