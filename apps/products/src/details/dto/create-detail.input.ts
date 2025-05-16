import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateDetailInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Field(() => String)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Field(() => String)
  value: string;
}
