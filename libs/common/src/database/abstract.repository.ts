import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractEntity } from './abstract.entity';

@Injectable()
export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly repo: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find({ ...options });
  }

  async findAllWithCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    const [items, total] = await this.repo.findAndCount({ ...options });
    return [items, total];
  }

  async findOne(
    where: FindOptionsWhere<T>,
    entityName: string,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const entity = await this.repo.findOne({ where, ...options });

    if (!entity) {
      this.logger.warn('Document not found with where', where);
      throw new NotFoundException(
        `${entityName} not found. Where: ${JSON.stringify(where)}`,
      );
    }

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    entityName: string,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    const updateResult = await this.repo.update(where, partialEntity);

    if (!updateResult.affected) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException(
        `${entityName} not found. Where: ${JSON.stringify(where)}`,
      );
    }

    return this.findOne(where, entityName);
  }

  async findOneAndDelete(where: FindOptionsWhere<T>, entityName: string) {
    await this.findOne(where, entityName);
    await this.repo.delete(where);
  }
}
