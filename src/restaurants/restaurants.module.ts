import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { S3Module } from 'src/UploadS3/s3.module';
import { UploadS3Controller } from 'src/UploadS3/upload-s3.controller';
import { UploadS3Service } from 'src/UploadS3/upload-s3.service';

@Module({
  imports: [S3Module],
  controllers: [RestaurantsController, UploadS3Controller],
  providers: [RestaurantsService, UploadS3Service],
})
export class RestaurantsModule {}
