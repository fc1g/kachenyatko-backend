import {
  DatabaseModule,
  HealthModule,
  LoggerModule,
  SERVICE,
} from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { NotificationsConsumer } from './notifications.consumer';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    LoggerModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ...(process.env.NODE_ENV === 'development' && {
          TYPEORM_HOST: Joi.string().required(),
          TYPEORM_PORT: Joi.number().required(),
          TYPEORM_USERNAME: Joi.string().required(),
          TYPEORM_PASSWORD: Joi.string().required(),
          TYPEORM_DATABASE: Joi.string().required(),
          TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
        }),

        ...(process.env.NODE_ENV === 'production' && {
          TYPEORM_URL: Joi.string().required(),
        }),

        SMTP_USER: Joi.string().required(),
        GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_OAUTH_REFRESH_TOKEN: Joi.string().required(),

        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),

        CORS_ORIGIN: Joi.string().required(),

        RABBITMQ_URL: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        PROMO_NOTIFICATIONS_QUEUE: Joi.string().required(),

        HTTP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: SERVICE.AUTH,
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.getOrThrow<string>('AUTH_HOST'),
            port: config.getOrThrow<number>('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    DatabaseModule,
    DatabaseModule.forFeature([NewsletterSubscription]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationsConsumer,
  ],
})
export class NotificationsModule {}
