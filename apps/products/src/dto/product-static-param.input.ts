import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProductStaticParamInput {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  id: string;
}
