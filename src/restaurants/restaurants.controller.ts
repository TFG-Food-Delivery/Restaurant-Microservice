import { Controller, Logger, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RestaurantsService } from './restaurants.service';
import {
  CreateDishDto,
  CreateMenuDto,
  CreateRestaurantDto,
  PaginationDto,
  RestaurantPaginationDto,
  UpdateDishDto,
  UpdateRestaurantDto,
} from './dto';

@Controller()
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}
  private readonly LOGGER = new Logger('RestaurantsController');

  /* -------------------------------------------------------------------------- */
  /*                                 Restaurant                                 */
  /* -------------------------------------------------------------------------- */
  @MessagePattern('createRestaurant')
  createRestaurant(@Payload() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.createRestaurant(createRestaurantDto);
  }
  @MessagePattern('createRestaurantMenu')
  createRestaurantMenu(@Payload() createMenuDto: CreateMenuDto) {
    return this.restaurantsService.createRestaurantMenu(createMenuDto);
  }

  @MessagePattern('findAllRestaurants')
  findAllRestaurants(
    @Payload() restaurantPaginationDto: RestaurantPaginationDto,
  ) {
    return this.restaurantsService.findAllRestaurants(restaurantPaginationDto);
  }

  @MessagePattern('findOneRestaurant')
  findOneRestaurant(@Payload('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOneRestaurant(id);
  }

  @MessagePattern('updateRestaurant')
  updateRestaurant(@Payload() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantsService.updateRestaurant(updateRestaurantDto);
  }

  @MessagePattern('removeRestaurant')
  remove(@Payload() id: number) {
    return this.restaurantsService.removeRestaurant(id);
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Dish                                    */
  /* -------------------------------------------------------------------------- */

  @MessagePattern('createDish')
  createDish(@Payload() payload: { id: string; createDishDto: CreateDishDto }) {
    const { id, createDishDto } = payload;
    return this.restaurantsService.createDish(id, createDishDto);
  }

  @MessagePattern('findAllDishes')
  findAllDishes(
    @Payload() payload: { id: string; paginationDto: PaginationDto },
  ) {
    const { id, paginationDto } = payload;
    return this.restaurantsService.findAllDishes(id, paginationDto);
  }
  @MessagePattern('findOneDish')
  findOneDish(@Payload('dishId', ParseUUIDPipe) dishId: string) {
    return this.restaurantsService.findOneDish(dishId);
  }

  @MessagePattern('updateDish')
  updateDish(@Payload() updateDishDto: UpdateDishDto) {
    this.LOGGER.log('Updated dish00');
    return this.restaurantsService.updateDish(updateDishDto);
  }
  @MessagePattern('deleteDish')
  deleteDish(@Payload('dishId', ParseUUIDPipe) dishId: string) {
    return this.restaurantsService.deleteDish(dishId);
  }
}
