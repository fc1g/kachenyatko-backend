import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateDetailInput } from '../details/dto/create-detail.input';
import { CreateImageInput } from '../images/dto/create-image.input';
import { CreateSpecificationInput } from '../specifications/dto/create-specification.input';

@InputType()
export class CreateProductInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Field(() => String)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field(() => String, { nullable: true })
  slug?: string;

  @IsArray()
  @Matches(/^#([0-9a-fA-F]{6})$/, {
    each: true,
    message: 'Color must be a valid HEX (#rrggbb)',
  })
  @Field(() => [String])
  colors: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Field(() => String)
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  fullDescription: string;

  @IsNumber()
  @Min(0)
  @Field(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Number, { nullable: true })
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Number, { nullable: true })
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Number, { nullable: true })
  totalSold?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageInput)
  @Field(() => [CreateImageInput])
  images: CreateImageInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailInput)
  @Field(() => [CreateDetailInput])
  details: CreateDetailInput[];

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => CreateSpecificationInput)
  @Field(() => CreateSpecificationInput)
  specification: CreateSpecificationInput;

  @IsArray()
  @IsUUID('4', { each: true })
  @Field(() => [String])
  categoryIds: string[];
}
