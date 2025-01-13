import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { RpcException } from '@nestjs/microservices';
import { readReplicas } from '@prisma/extension-read-replicas';
import { envs } from 'src/config';
import {
  CreateRestaurantDto,
  CreateMenuDto,
  CreateDishDto,
  UpdateRestaurantDto,
  PaginationDto,
  UpdateDishDto,
  SearchPaginationDto,
} from './dto';

@Injectable()
export class RestaurantsService extends PrismaClient implements OnModuleInit {
  private readonly LOGGER = new Logger('RestaurantsService');

  onModuleInit() {
    // this.$extends(
    //   readReplicas({
    //     url: [envs.follower1DatabaseUrl, envs.follower2DatabaseUrl],
    //   }),
    // );
    this.$connect();
    this.LOGGER.log('Connected to the database');
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Restaurant                                 */
  /* -------------------------------------------------------------------------- */

  /**
   * Creates a new restaurant in the system.
   *
   * @param createRestaurantDto - Data Transfer Object containing the details of the new restaurant.
   * @throws RpcException - If a restaurant with the same email already exists.
   * @returns The created restaurant.
   */
  async createRestaurant(createRestaurantDto: CreateRestaurantDto) {
    const existingRestaurant = await this.restaurant.findFirst({
      where: { email: createRestaurantDto.email },
    });
    if (existingRestaurant) {
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: `Restaurant with email ${createRestaurantDto.email} already exists`,
      });
    }

    const { address, restaurantName, ...restaurantData } = createRestaurantDto;
    return this.restaurant.create({
      data: {
        ...restaurantData,
        name: restaurantName,
        address: {
          create: address,
        },
      },
    });
  }

  /**
   * Searches for restaurants based on the provided pagination and search criteria.
   *
   * @param {RestaurantPaginationDto} restaurantPaginationDto - The pagination and search criteria.
   * @param {string} restaurantPaginationDto.search - The search term to match against restaurant names or cuisine types.
   * @param {number} restaurantPaginationDto.page - The page number for pagination.
   * @param {number} restaurantPaginationDto.limit - The number of items per page.
   *
   * @returns {Promise<{ data: Restaurant[], meta: { total: number, page: number, lastPage: number } }>}
   * An object containing the search results and pagination metadata.
   *
   * @throws {Error} If an error occurs during the search.
   */
  async searchRestaurants(searchPaginationDto: SearchPaginationDto) {
    const { search, page, limit } = searchPaginationDto;
    const where: Prisma.RestaurantWhereInput = {};

    // Match partial name OR exact cuisineType if search is provided
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    let select: Prisma.RestaurantSelect | undefined;
    if (search) {
      select = {
        id: true,
        name: true,
        cuisineType: true,
        image: true,
      };
    }

    const [totalCount, data] = await this.$transaction([
      this.restaurant.count({ where }),
      this.restaurant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        select,
      }),
    ]);

    return {
      data,
      meta: {
        total: totalCount,
        page,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Retrieves a specific restaurant by its ID.
   *
   * @param id - The ID of the restaurant to retrieve.
   * @returns The restaurant if found, otherwise throws an exception.
   * @throws RpcException if the restaurant is not found.
   */
  async findOneRestaurant(id: string) {
    const restaurant = await this.restaurant.findUnique({
      where: { id },
      include: {
        address: true,
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

  /**
   * Updates a specific restaurant in the system.
   *
   * @param updateRestaurantDto - Data Transfer Object containing the details to update.
   *
   * @returns The updated restaurant.
   * @throws RpcException - If the restaurant with the given ID is not found.
   */
  async updateRestaurant(updateRestaurantDto: UpdateRestaurantDto) {
    const { id, ...data } = updateRestaurantDto;

    await this.findOneRestaurant(id);

    return this.restaurant.update({
      where: { id },
      data: {
        ...data,
        address: {
          update: data.address,
        },
      },
    });
  }

  /**
   * Deletes (marks as unavailable) a specific restaurant by its ID.
   *
   * @param id - The ID of the restaurant to delete.
   * @returns The deleted restaurant.
   * @throws RpcException - If the restaurant with the given ID is not found.
   */
  async deleteRestaurant(id: string) {
    await this.findOneRestaurant(id);
    return this.restaurant.delete({ where: { id } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Dishes                                   */
  /* -------------------------------------------------------------------------- */

  /**
   * Creates a new category for a specific restaurant.
   * @param id - The ID of the restaurant.
   * @param categoryName - The name of the category to create.
   * @returns The created category.
   * @throws RpcException - If the restaurant with the given ID is not found.
   */
  async createCategory(id: string, categoryName: string) {
    const restaurant = await this.findOneRestaurant(id);
    const category = await this.category.create({
      data: {
        name: categoryName,
        restaurantId: restaurant.id,
      },
    });
    return category;
  }

  /**
   * Creates a new dish for a specific restaurant.
   * @param id - The ID of the restaurant.
   * @param createDishDto - Data Transfer Object containing dish details.
   * @returns The created dish.
   */
  async createDish(id: string, createDishDto: CreateDishDto) {
    const restaurant = await this.findOneRestaurant(id);
    console.log(createDishDto);
    const dish = await this.dish.create({
      data: {
        name: createDishDto.name,
        description: createDishDto.description,
        price: createDishDto.price,
        image: createDishDto.image,
        allergens: createDishDto.allergens,
        categoryId: createDishDto.categoryId,
        restaurantId: restaurant.id,
      },
    });

    return dish;
  }

  /**
   * Retrieves all dishes for a specific restaurant with pagination.
   * @param id - The ID of the restaurant.
   * @param paginationDto - Data Transfer Object containing pagination details.
   * @returns An object containing the dishes and pagination metadata.
   * @throws RpcException if no dishes are found.
   */
  async findAllDishes(
    restaurantId: string,
    searchPaginationDto: SearchPaginationDto,
  ) {
    const { search, page, limit } = searchPaginationDto;
    const where: Prisma.DishWhereInput = {};

    // Match partial name OR exact cuisineType if search is provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    where.restaurantId = restaurantId;

    // Get categories with their dishes
    const categories = await this.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        categories: {
          select: {
            id: true,
            name: true,
            dishes: {
              where,
              skip: (page - 1) * limit,
              take: limit,
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                image: true,
                isAvailable: true,
                allergens: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await this.dish.count({ where });

    // Transform data to group by categories
    const formattedData = categories.categories.map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      dishes: category.dishes,
    }));

    return {
      data: formattedData,
      meta: {
        total: totalCount,
        page,
        lastPage: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Retrieves all dishes in an array of dish IDs with pagination.
   * @param dishesIds - Array of dish IDs.
   * @param paginationDto - Data Transfer Object containing pagination details.
   * @returns An object containing the dishes and pagination metadata.
   * @throws RpcException if no dishes are found or if dishes belong to different restaurants.
   */
  async findAllDishesInArray(
    dishesIds: string[],
    paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;

    const dishes = await this.dish.findMany({
      where: {
        id: { in: dishesIds },
      },
      select: {
        id: true,
        restaurantId: true,
      },
    });

    if (dishes.length === 0) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Dishes not found.',
      });
    }

    const restaurantId = dishes[0].restaurantId;
    const mismatch = dishes.some((dish) => dish.restaurantId !== restaurantId);

    if (mismatch) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Some dishes belong to different restaurants.',
      });
    }

    const totalPages = await this.dish.count({
      where: {
        restaurantId: restaurantId,
      },
    });

    if (!totalPages) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'No dishes found.',
      });
    }

    let whereCondition = {
      restaurantId: restaurantId,
    };

    if (dishesIds && dishesIds.length > 0) {
      whereCondition = Object.assign({}, whereCondition, {
        id: {
          in: dishesIds,
        },
      });
    }

    const foundDishes = await this.dish.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        isAvailable: true,
      },
    });

    return {
      data: {
        restaurantId,
        cart: foundDishes,
      },
      meta: {
        total: totalPages,
        page: page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  /**
   * Retrieves a specific dish by ID.
   * @param dishId - The ID of the dish to retrieve.
   * @returns The dish if found, otherwise throws an exception.
   * @throws RpcException if the dish is not found.
   */
  async findOneDish(dishId: string) {
    const dish = await this.dish.findUnique({
      where: { id: dishId },
    });

    if (!dish) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Dish #${dishId} not found`,
      });
    }

    const { createdAt, updatedAt, ...dishData } = dish;

    return dishData;
  }

  /**
   * Updates a specific dish.
   * @param updateDishDto - Data Transfer Object containing update details.
   * @returns The updated dish.
   */
  async updateDish(updateDishDto: UpdateDishDto) {
    const { dishId, ...data } = updateDishDto;
    await this.findOneDish(dishId);
    const updatedDish = await this.dish.update({
      where: { id: dishId },
      data: data,
    });

    return updatedDish;
  }

  /**
   * Deletes (marks as unavailable) a specific dish.
   * @param dishId - The ID of the dish to delete.
   * @returns The updated dish.
   */
  async deleteDish(dishId: string) {
    await this.findOneDish(dishId);
    const updatedDish = await this.dish.update({
      where: { id: dishId },
      data: { isAvailable: false },
    });

    return updatedDish;
  }
}
