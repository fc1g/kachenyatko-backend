import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractEntity } from './abstract.entity';

@Injectable()
export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly repo: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    const entity = await this.repo.findOne({ where, relations });

    if (!entity) {
      this.logger.warn('Document not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    const updateResult = await this.repo.update(where, partialEntity);

    if (!updateResult.affected) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return this.findOne(where);
  }

  async find(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repo.findBy(where);
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    await this.findOne(where);
    await this.repo.delete(where);
  }
}
