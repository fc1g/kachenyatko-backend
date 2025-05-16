import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateImageInput {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @Field(() => String)
  url: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Field(() => String)
  altText: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  position: number;
}
