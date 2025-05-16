import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateSpecificationInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  size: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  ageGroup: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  material: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  packageSize: string;
}
