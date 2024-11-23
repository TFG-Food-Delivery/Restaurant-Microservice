import { Module } from '@nestjs/common';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [RestaurantsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
