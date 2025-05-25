import { Resolver } from '@nestjs/graphql';
import { Detail } from './entities/detail.entity';

@Resolver(() => Detail)
export class DetailsResolver {
  // constructor(private readonly detailsService: DetailsService) {}
  // TODO: Update detail
}
