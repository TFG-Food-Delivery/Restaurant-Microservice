import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadS3Service } from './upload-s3.service';

@Controller()
export class UploadS3Controller {
  constructor(private readonly uploadS3service: UploadS3Service) {}

  @MessagePattern('uploadDishImage')
  async uploadImage(@Payload() data: any) {
    const { restaurantId, file } = data;
    return this.uploadS3service.uploadFile(file, restaurantId);
  }
}
