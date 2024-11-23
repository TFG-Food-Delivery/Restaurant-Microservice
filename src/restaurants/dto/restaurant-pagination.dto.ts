import { CuisineType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { CuisineTypeList } from '../enum';

export class RestaurantPaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(CuisineTypeList, {
    message: `cuisineType must be one of the following values: ${Object.values(CuisineType)}`,
  })
  cuisineType?: CuisineType;
}
