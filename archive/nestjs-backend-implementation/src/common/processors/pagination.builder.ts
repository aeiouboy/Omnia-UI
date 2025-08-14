import { PaginationDto, PaginationRequestDto } from '../dtos';

export class PaginationBuilder {
  public static formatPaginationToFindOption({
    page = 1,
    size = 25,
  }: Partial<PaginationRequestDto>): PaginationDto {
    return { offset: (page - 1) * size, limit: size };
  }
}
