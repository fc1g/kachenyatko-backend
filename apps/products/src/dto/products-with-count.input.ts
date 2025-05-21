import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';

@ObjectType()
export class ProductsWithCountInput {
  @Field(() => [Product])
  items: Product[];

  @Field(() => Int)
  total: number;
}
