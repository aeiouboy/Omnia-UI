import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class PaginationRequestDto {
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;
}

export class PaginationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  offset: number;
}
