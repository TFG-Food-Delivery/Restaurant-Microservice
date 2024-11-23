import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMilitaryTime,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AllergensList } from '../enum/allergen.enum';
import { CuisineTypeList } from '../enum/cuisine-type.enum';
import { CuisineType } from '@prisma/client';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsPhoneNumber('ES')
  phoneNumber: string;

  @IsString()
  @MaxLength(64)
  address: string;

  @IsEnum(CuisineTypeList, {
    message: `cuisineType must be one of the following values: ${AllergensList}`,
  })
  cuisineType: CuisineType;

  @IsString()
  @IsMilitaryTime()
  openHour: string;

  @IsString()
  @IsMilitaryTime()
  closeHour: string;
}
