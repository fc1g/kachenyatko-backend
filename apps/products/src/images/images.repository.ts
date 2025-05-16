import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesRepository extends AbstractRepository<Image> {
  protected readonly logger: Logger = new Logger(ImagesRepository.name);

  constructor(
    @InjectRepository(Image) repo: Repository<Image>,
    entityManager: EntityManager,
  ) {
    super(repo, entityManager);
  }
}
