import { CuisineType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { CuisineTypeList } from '../enum';
import { PaginationDto } from './pagination.dto';

export class RestaurantPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CuisineTypeList, {
    message: `cuisineType must be one of the following values: ${Object.values(CuisineType)}`,
  })
  cuisineType?: CuisineType;
}
