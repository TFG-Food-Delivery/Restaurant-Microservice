import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './create-dish.dto';
import { IsUUID } from 'class-validator';

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @IsUUID(4)
  dishId: string;
}
