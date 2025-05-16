import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { Specification } from './entities/specification.entity';
import { SpecificationsRepository } from './specifications.repository';
import { SpecificationsResolver } from './specifications.resolver';
import { SpecificationsService } from './specifications.service';

@Module({
  imports: [DatabaseModule.forFeature([Specification])],
  providers: [
    SpecificationsService,
    SpecificationsRepository,
    SpecificationsResolver,
  ],
  exports: [SpecificationsService],
})
export class SpecificationsModule {}
