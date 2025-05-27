import { StatusResponseDto } from '@app/common';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly transporter: Transporter;

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

  async sendPromo() {
    const subscriptions = await this.repo.findAll({ where: { active: true } });

    // TODO: Send promo to all active subscriptions. In sequence in rabbitmq queue.
    return subscriptions;
  }

  async notifyEmail({ email, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('SMTP_USER'),
      to: email,
      subject: 'Kachenyatko Store Notification',
      text,
    });
  }
}
