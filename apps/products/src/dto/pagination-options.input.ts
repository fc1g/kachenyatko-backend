import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsNumber, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class PaginationOptionsInput {
  @IsNumber()
  @Min(1)
  @Field(() => Number)
  take: number;

  @IsNumber()
  @Min(0)
  @Field(() => Number)
  skip: number;

  @IsString()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  @Field(() => String)
  sort: 'ASC' | 'DESC' | 'asc' | 'desc';

  @IsUUID('4', { each: true })
  @Field(() => [ID])
  categoryIds: string[];
}
