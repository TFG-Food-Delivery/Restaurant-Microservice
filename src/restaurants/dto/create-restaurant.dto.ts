import {
  IsEmail,
  IsEnum,
  IsMilitaryTime,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CuisineType } from '@prisma/client';
import { AddressDto } from './address.dto';
import { CuisineTypeList } from '../enum';

export class CreateRestaurantDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  restaurantName: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image: string;

  @IsEnum(CuisineTypeList, {
    message: `cuisineType must be one of the following values: ${CuisineTypeList}`,
  })
  cuisineType: CuisineType;

  @IsString()
  @IsMilitaryTime()
  openHour: string;

  @IsString()
  @IsMilitaryTime()
  closeHour: string;
}
