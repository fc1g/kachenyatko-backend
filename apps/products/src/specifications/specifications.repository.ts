import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Specification } from './entities/specification.entity';

@Injectable()
export class SpecificationsRepository extends AbstractRepository<Specification> {
  protected readonly logger: Logger = new Logger(SpecificationsRepository.name);

  constructor(
    @InjectRepository(Specification) repo: Repository<Specification>,
    entityManager: EntityManager,
  ) {
    super(repo, entityManager);
  }
}
