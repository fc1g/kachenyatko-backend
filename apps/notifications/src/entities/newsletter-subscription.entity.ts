import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription extends AbstractEntity<NewsletterSubscription> {
  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('boolean', { default: true })
  active: boolean;
}
