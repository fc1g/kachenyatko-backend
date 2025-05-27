import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';

@Injectable()
export class NotificationsRepository extends AbstractRepository<NewsletterSubscription> {
  protected readonly logger = new Logger(NotificationsRepository.name);

  constructor(
    @InjectRepository(NewsletterSubscription)
    repo: Repository<NewsletterSubscription>,
    entitiManager: EntityManager,
  ) {
    super(repo, entitiManager);
  }
}
