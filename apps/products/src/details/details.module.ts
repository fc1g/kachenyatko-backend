import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { DetailsRepository } from './details.repository';
import { DetailsResolver } from './details.resolver';
import { DetailsService } from './details.service';
import { Detail } from './entities/detail.entity';

@Module({
  imports: [DatabaseModule.forFeature([Detail])],
  providers: [DetailsService, DetailsRepository, DetailsResolver],
  exports: [DetailsService],
})
export class DetailsModule {}
