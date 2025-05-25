import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StatusResponseDto {
  @Field(() => Number)
  statusCode: number;

  @Field(() => String)
  message: string;
}
