import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../entities/product.entity';

@ObjectType()
export class ProductsWithCount {
  @Field(() => [Product])
  data: Product[];

  @Field(() => Int)
  total: number;
}
