import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export class CustomIngredientDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @Max(10)
  @IsOptional()
  maxExtras?: number = 3;
}
