import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaClient } from '@prisma/client';
import { RestaurantPaginationDto } from './dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RestaurantsService extends PrismaClient implements OnModuleInit {
  private readonly LOGGER = new Logger('RestaurantsService');

  onModuleInit() {
    this.$connect();
    this.LOGGER.log('Connected to the database');
  }
  create(createRestaurantDto: CreateRestaurantDto) {
    return this.restaurant.create({
      data: createRestaurantDto,
    });
  }

  async findAll(restaurantPaginationDto: RestaurantPaginationDto) {
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

  async findOne(id: string) {
    this.LOGGER.log(`Finding restaurant #${id}`);
    const restaurant = await this.restaurant.findUnique({
      where: { id },
    });
    if (!restaurant) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Restaurant #${id} not found`,
      });
    }

    return restaurant;
  }

  async update(updateRestaurantDto: UpdateRestaurantDto) {
    const { id, ...data } = updateRestaurantDto;

    await this.findOne(id);

    return this.restaurant.update({
      where: { id },
      data: data,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} restaurant`;
  }
}
