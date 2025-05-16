import { InputType, PartialType } from '@nestjs/graphql';
import { CreateSpecificationInput } from './create-specification.input';

@InputType()
export class UpdateSpecificationInput extends PartialType(
  CreateSpecificationInput,
) {}
