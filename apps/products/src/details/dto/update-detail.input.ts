import { InputType, PartialType } from '@nestjs/graphql';
import { CreateDetailInput } from './create-detail.input';

@InputType()
export class UpdateDetailInput extends PartialType(CreateDetailInput) {}
