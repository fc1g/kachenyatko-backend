import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { Image } from './entities/image.entity';
import { ImagesRepository } from './images.repository';
import { ImagesResolver } from './images.resolver';
import { ImagesService } from './images.service';

@Module({
  imports: [DatabaseModule.forFeature([Image])],
  providers: [ImagesService, ImagesRepository, ImagesResolver],
  exports: [ImagesService],
})
export class ImagesModule {}
