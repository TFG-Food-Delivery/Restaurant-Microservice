import { IsArray, IsUUID } from 'class-validator';

export class DishesIdDto {
  @IsArray()
  @IsUUID('4', { each: true })
  dishesId: string[] = [];
}
