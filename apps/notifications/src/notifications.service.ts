import { StatusResponseDto } from '@app/common';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelWrapper, connect } from 'amqp-connection-manager';
import { plainToClass } from 'class-transformer';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import pLimit from 'p-limit';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { PromoPayloadDto } from './dto/promo-payload.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter: Transporter;
  private readonly promoQueueName: string;

  constructor(
    private readonly repo: NotificationsRepository,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        clientId: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_CLIENT_ID',
        ),
        clientSecret: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_CLIENT_SECRET',
        ),
        refreshToken: this.configService.getOrThrow<string>(
          'GOOGLE_OAUTH_REFRESH_TOKEN',
        ),
      },
    });

    this.promoQueueName = this.configService.getOrThrow(
      'PROMO_NOTIFICATIONS_QUEUE',
    );
  }

  async subscribeToNewsletter(
    subscriptionDto: SubscriptionDto,
  ): Promise<StatusResponseDto> {
    try {
      await this.validateSubscription(subscriptionDto.email);
      await this.createSubscription(subscriptionDto);
    } catch (err) {
      console.error(err);
      await this.repo.findOneAndUpdate(
        { email: subscriptionDto.email },
        'Email',
        { active: true },
      );
    }

    return { statusCode: 200, message: 'Email subscribed to newsletter' };
  }

  private async createSubscription(subscriptionDto: SubscriptionDto) {
    const subscription = plainToClass(NewsletterSubscription, {
      ...subscriptionDto,
      active: true,
    });
    return this.repo.create(subscription);
  }

  private async validateSubscription(email: string): Promise<void> {
    try {
      await this.repo.findOne({ email }, 'Email');
    } catch (err) {
      console.error(err);
      return;
    }

    throw new UnprocessableEntityException(
      'Email already subscribed to newsletter',
    );
  }

  async unsubscribeFromNewsletter(
    subscriptionDto: SubscriptionDto,
  ): Promise<StatusResponseDto> {
    try {
      await this.repo.findOneAndUpdate(
        { email: subscriptionDto.email },
        'Email',
        { active: false },
      );
      return { statusCode: 204, message: 'Email unsubscribed from newsletter' };
    } catch (err) {
      return {
        statusCode: 500,
        message:
          err instanceof Error
            ? err.message
            : 'Failed to unsubscribe from newsletter',
      };
    }
  }

  async sendPromo(promoPayloadDto: PromoPayloadDto): Promise<void> {
    const subs = await this.repo.findAll({ where: { active: true } });
    if (subs.length === 0) {
      this.logger.log('No active subscriptions found');
      return;
    }

    const channel = this.setupRabbitMQChannel();

    const limit = pLimit(10);
    const tasks = subs.map((sub) =>
      limit(async () => {
        const payload = {
          email: sub.email,
          ...promoPayloadDto,
        };

        return channel.sendToQueue(
          this.promoQueueName,
          Buffer.from(JSON.stringify(payload)),
          {
            persistent: true,
          },
        );
      }),
    );

    await Promise.all(tasks);
    this.logger.log(`Promo tasks ${subs.length} published`);
  }

  private setupRabbitMQChannel(): ChannelWrapper {
    const rabbitmqUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const connection = connect([rabbitmqUrl], { reconnectTimeInSeconds: 5 });

    connection.on('connect', () => this.logger.log('✅ Connected to RabbitMQ'));
    connection.on('disconnect', (params) =>
      this.logger.error('❌ Disconnected from RabbitMQ', params.err),
    );

    return connection.createChannel({
      json: false,
      setup: async (channel: Channel) =>
        channel.assertQueue(this.promoQueueName, { durable: true }),
    });
  }

  async notifyEmail({ email, subject, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: email,
      subject,
      text,
    });
  }
}
