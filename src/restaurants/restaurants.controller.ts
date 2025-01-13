import { Controller, Logger, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RestaurantsService } from './restaurants.service';
import {
  CreateDishDto,
  CreateMenuDto,
  CreateRestaurantDto,
  PaginationDto,
  SearchPaginationDto,
  UpdateDishDto,
  UpdateRestaurantDto,
} from './dto';

/**
 * Controller for handling restaurant-related operations.
 */
@Controller()
export class RestaurantsController {
  /**
   * Constructs a new instance of RestaurantsController.
   * @param restaurantsService - The service to handle restaurant operations.
   */
  constructor(private readonly restaurantsService: RestaurantsService) {}

  private readonly LOGGER = new Logger('RestaurantsController');

  /**
   * Creates a new restaurant.
   * @param createRestaurantDto - The data transfer object containing restaurant details.
   * @returns The created restaurant.
   */
  @MessagePattern('createRestaurant')
  createRestaurant(@Payload() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.createRestaurant(createRestaurantDto);
  }

  /**
   * Retrieves all restaurants with pagination.
   * @param restaurantPaginationDto - The data transfer object containing pagination details.
   * @returns A list of restaurants.
   */
  @MessagePattern('findAllRestaurants')
  findAllRestaurants(
    @Payload()
    searchPaginationDto: SearchPaginationDto,
  ) {
    return this.restaurantsService.searchRestaurants(searchPaginationDto);
  }

  /**
   * Retrieves a single restaurant by its ID.
   * @param id - The UUID of the restaurant.
   * @returns The restaurant with the specified ID.
   */
  @MessagePattern('findOneRestaurant')
  findOneRestaurant(@Payload('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.findOneRestaurant(id);
  }

  /**
   * Updates an existing restaurant.
   * @param updateRestaurantDto - The data transfer object containing updated restaurant details.
   * @returns The updated restaurant.
   */
  @MessagePattern('updateRestaurant')
  updateRestaurant(@Payload() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantsService.updateRestaurant(updateRestaurantDto);
  }

  /**
   * Deletes a restaurant by its ID.
   * @param id - The UUID of the restaurant.
   * @returns The result of the deletion operation.
   */
  @MessagePattern('deleteRestaurant')
  deleteRestaurant(@Payload('id', ParseUUIDPipe) id: string) {
    return this.restaurantsService.deleteRestaurant(id);
  }

  /**
   * Creates a new category for a restaurant.
   * @param payload - An object containing the restaurant ID and the category name.
   * @returns The created category.
   */
  @MessagePattern('createCategory')
  createCategory(@Payload() payload: { id: string; categoryName: string }) {
    const { id, categoryName } = payload;
    return this.restaurantsService.createCategory(id, categoryName);
  }

  /**
   * Creates a new dish for a restaurant.
   * @param payload - An object containing the restaurant ID and the dish details.
   * @returns The created dish.
   */
  @MessagePattern('createDish')
  createDish(@Payload() payload: { id: string; createDishDto: CreateDishDto }) {
    const { id, createDishDto } = payload;
    return this.restaurantsService.createDish(id, createDishDto);
  }

  /**
   * Retrieves all dishes for a restaurant with pagination.
   * @param payload - An object containing the restaurant ID and pagination details.
   * @returns A list of dishes.
   */
  @MessagePattern('findAllDishes')
  findAllDishes(
    @Payload()
    payload: {
      id: string;
      searchPaginationDto: SearchPaginationDto;
    },
  ) {
    const { id, searchPaginationDto } = payload;
    return this.restaurantsService.findAllDishes(id, searchPaginationDto);
  }

  /**
   * Retrieves all dishes in an array of dish IDs with pagination.
   * @param payload - An object containing the array of dish IDs and pagination details.
   * @returns A list of dishes.
   */
  @MessagePattern('findAllDishesInArray')
  findAllDishesInArray(
    @Payload()
    payload: {
      dishesIds: string[];
      paginationDto: PaginationDto;
    },
  ) {
    const { dishesIds, paginationDto } = payload;
    return this.restaurantsService.findAllDishesInArray(
      dishesIds,
      paginationDto,
    );
  }

  /**
   * Retrieves a single dish by its ID.
   * @param payload - An object containing the dish ID.
   * @returns The dish with the specified ID.
   */
  @MessagePattern('findOneDish')
  findOneDish(@Payload() payload: { dishId: string }) {
    return this.restaurantsService.findOneDish(payload.dishId);
  }

  /**
   * Updates an existing dish.
   * @param updateDishDto - The data transfer object containing updated dish details.
   * @returns The updated dish.
   */
  @MessagePattern('updateDish')
  updateDish(@Payload() updateDishDto: UpdateDishDto) {
    return this.restaurantsService.updateDish(updateDishDto);
  }

  /**
   * Deletes a dish by its ID.
   * @param dishId - The UUID of the dish.
   * @returns The result of the deletion operation.
   */
  @MessagePattern('deleteDish')
  deleteDish(@Payload('dishId', ParseUUIDPipe) dishId: string) {
    return this.restaurantsService.deleteDish(dishId);
  }
}
