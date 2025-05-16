import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository extends AbstractRepository<Category> {
  protected readonly logger: Logger = new Logger(CategoriesRepository.name);

  constructor(
    @InjectRepository(Category) repo: Repository<Category>,
    entityManager: EntityManager,
  ) {
    super(repo, entityManager);
  }
}
