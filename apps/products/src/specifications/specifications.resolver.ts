import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Specification } from './entities/specification.entity';
import { SpecificationsService } from './specifications.service';

@Resolver(() => Specification)
export class SpecificationsResolver {
  constructor(private readonly specificationsService: SpecificationsService) {}

  @Query(() => Specification, { name: 'specification' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.specificationsService.findOne(id);
  }
}
