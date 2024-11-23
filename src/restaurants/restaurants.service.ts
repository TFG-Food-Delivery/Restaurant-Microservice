import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaClient } from '@prisma/client';
import {
  CreateDishDto,
  CreateMenuDto,
  PaginationDto,
  RestaurantPaginationDto,
  UpdateDishDto,
} from './dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RestaurantsService extends PrismaClient implements OnModuleInit {
  private readonly LOGGER = new Logger('RestaurantsService');

  onModuleInit() {
    this.$connect();
    this.LOGGER.log('Connected to the database');
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Restaurant                                 */
  /* -------------------------------------------------------------------------- */

  createRestaurant(createRestaurantDto: CreateRestaurantDto) {
    return this.restaurant.create({
      data: createRestaurantDto,
    });
  }

  async createRestaurantMenu(createMenuDto: CreateMenuDto) {
    await this.findOneRestaurant(createMenuDto.id);

    const menu = await this.menu.create({
      data: {
        restaurantId: createMenuDto.id,
        dishes: {
          createMany: {
            data: createMenuDto.dishes.map((dish: CreateDishDto) => ({
              name: dish.name,
              description: dish.description,
              image: dish.image,
              price: dish.price,
              allergens: dish.allergens,
            })),
          },
        },
      },
      include: {
        dishes: {
          select: {
            id: true,
          },
        },
      },
    });

    const dishesWithIds = menu.dishes;

    await this.customIngredient.createMany({
      data: createMenuDto.dishes
        .map((dish: CreateDishDto, index: number) =>
          dish.customIngredients.map((customIngredient) => ({
            dishId: dishesWithIds[index].id, // Asignamos el `id` del plato creado
            name: customIngredient.name,
            maxExtras: customIngredient.maxExtras,
          })),
        )
        .flat(),
    });

    return menu;
  }

  async findAllRestaurants(restaurantPaginationDto: RestaurantPaginationDto) {
    const { page, limit, cuisineType } = restaurantPaginationDto;
    const totalPages = await this.restaurant.count({
      where: {
        cuisineType: cuisineType,
      },
    });
    if (!totalPages) {
      const message = cuisineType
        ? `No restaurants found with cuisineType ${cuisineType}.`
        : 'No restaurants found.';
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: message,
      });
    }
    return {
      data: await this.restaurant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          cuisineType: cuisineType,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOneRestaurant(id: string) {
    const restaurant = await this.restaurant.findUnique({
      where: { id },
      include: {
        menu: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!restaurant) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Restaurant #${id} not found`,
      });
    }

    return restaurant;
  }

  async updateRestaurant(updateRestaurantDto: UpdateRestaurantDto) {
    const { id, ...data } = updateRestaurantDto;

    await this.findOneRestaurant(id);

    return this.restaurant.update({
      where: { id },
      data: data,
    });
  }

  removeRestaurant(id: number) {
    return `This action removes the restaurant #${id}`;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Dishes                                   */
  /* -------------------------------------------------------------------------- */

  async createDish(id, createDishDto: CreateDishDto) {
    const restaurant = await this.findOneRestaurant(id);
    const { customIngredients, ...dishData } = createDishDto;
    const dish = await this.dish.create({
      data: {
        ...dishData,
        menuId: restaurant.menu.id,
      },
    });

    await this.customIngredient.createMany({
      data: createDishDto.customIngredients.map((customIngredient) => ({
        dishId: dish.id, // Asignamos el `id` del plato creado
        name: customIngredient.name,
        maxExtras: customIngredient.maxExtras,
      })),
    });

    return dish;
  }

  async findAllDishes(id: string, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const restaurant = await this.findOneRestaurant(id);

    const totalPages = await this.dish.count({
      where: {
        menuId: restaurant.menu.id,
      },
    });
    if (!totalPages) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'No dishes found.',
      });
    }
    return {
      data: await this.dish.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          menuId: restaurant.menu.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          isAvailable: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOneDish(dishId: string) {
    const dish = await this.dish.findUnique({
      where: { id: dishId },
      include: {
        customIngredients: {
          select: {
            id: true,
            name: true,
            maxExtras: true,
          },
        },
      },
    });

    if (!dish) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Dish #${dishId} not found`,
      });
    }

    const { createdAt, updatedAt, menuId, ...dishData } = dish;

    return dishData;
  }

  async updateDish(updateDishDto: UpdateDishDto) {
    const { dishId, customIngredients, ...data } = updateDishDto;
    const dish = await this.findOneDish(dishId);
    const updatedDish = await this.dish.update({
      where: { id: dishId },
      data: data,
    });
    if (customIngredients && customIngredients.length > 0) {
      await this.$transaction([
        // Eliminar todos los customIngredients asociados al dish
        this.customIngredient.deleteMany({
          where: { dishId: dishId },
        }),
        // Crear los nuevos customIngredients
        ...customIngredients.map((customIngredient) =>
          this.customIngredient.create({
            data: {
              name: customIngredient.name,
              maxExtras: customIngredient.maxExtras,
              dishId: dishId,
            },
          }),
        ),
      ]);
    }

    return updatedDish;
  }

  async deleteDish(dishId: string) {
    await this.findOneDish(dishId);
    const updatedDish = await this.dish.update({
      where: { id: dishId },
      data: { isAvailable: false },
    });

    return updatedDish;
  }
}
