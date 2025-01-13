import { Allergen } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AllergensList } from '../enum';
import { Type } from 'class-transformer';

export class CreateDishDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsUrl()
  image?: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsArray()
  @IsEnum(AllergensList, {
    message: `allergens must be one of the following values: ${AllergensList}`,
    each: true,
  })
  allergens: Allergen[] = [];

  @IsBoolean()
  @IsOptional()
  isAvailable: boolean;
}
