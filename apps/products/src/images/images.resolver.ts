import { Resolver } from '@nestjs/graphql';
import { Image } from './entities/image.entity';

@Resolver(() => Image)
export class ImagesResolver {
  // constructor(private readonly imagesService: ImagesService) {}
  // TODO: Update image
}
