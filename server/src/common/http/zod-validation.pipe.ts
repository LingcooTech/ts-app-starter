import { BadRequestException, type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata?: ArgumentMetadata): T {
    void _metadata;
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: z.treeifyError(result.error),
      });
    }
    return result.data;
  }
}
