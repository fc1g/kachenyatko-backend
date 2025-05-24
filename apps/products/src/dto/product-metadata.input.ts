import { Field, ObjectType } from '@nestjs/graphql';
import { Category } from '../categories/entities/category.entity';
import { Image } from '../images/entities/image.entity';

@ObjectType()
export class ProductMetadataInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  shortDescription: string;

  @Field(() => [Image])
  images: Image[];

  @Field(() => [Category])
  categories: Category[];
}
