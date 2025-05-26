import { Field, ObjectType } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';

@ObjectType()
export class StatusResponseDto {
  @Field(() => Number)
  @IsNumber()
  statusCode: number;

  @Field(() => String)
  @IsString()
  message: string;
}
