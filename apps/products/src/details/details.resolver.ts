import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { DetailsService } from './details.service';
import { Detail } from './entities/detail.entity';

@Resolver(() => Detail)
export class DetailsResolver {
  constructor(private readonly detailsService: DetailsService) {}

  @Query(() => Detail, { name: 'detail' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.detailsService.findOne(id);
  }
}
