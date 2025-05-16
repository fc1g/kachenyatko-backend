import { InputType, PartialType } from '@nestjs/graphql';
import { CreateImageInput } from './create-image.input';

@InputType()
export class UpdateImageInput extends PartialType(CreateImageInput) {}
