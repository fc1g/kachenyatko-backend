import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Detail } from './entities/detail.entity';

@Injectable()
export class DetailsRepository extends AbstractRepository<Detail> {
  protected readonly logger: Logger = new Logger(DetailsRepository.name);

  constructor(
    @InjectRepository(Detail) repo: Repository<Detail>,
    entityManager: EntityManager,
  ) {
    super(repo, entityManager);
  }
}
