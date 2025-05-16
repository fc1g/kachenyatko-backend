import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Image } from './entities/image.entity';
import { ImagesService } from './images.service';

@Resolver(() => Image)
export class ImagesResolver {
  constructor(private readonly imagesService: ImagesService) {}

  @Query(() => Image, { name: 'image' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.imagesService.findOne(id);
  }
}
