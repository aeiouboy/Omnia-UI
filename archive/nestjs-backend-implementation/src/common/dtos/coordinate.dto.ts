import { IsNumber } from 'class-validator';

export class CoOrdinateDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
