import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateDishDto } from './create-dish.dto';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @IsUUID(4)
  @IsString()
  id: string;

  @IsArray()
  @ValidateNested({ each: true }) // Valida cada elemento del array
  @Type(() => CreateDishDto)
  @ArrayMinSize(1)
  dishes: CreateDishDto[];
}
