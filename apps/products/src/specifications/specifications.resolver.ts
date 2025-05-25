import { Resolver } from '@nestjs/graphql';
import { Specification } from './entities/specification.entity';

@Resolver(() => Specification)
export class SpecificationsResolver {
  // constructor(private readonly specificationsService: SpecificationsService) {}
  // TODO: Update specification
}
