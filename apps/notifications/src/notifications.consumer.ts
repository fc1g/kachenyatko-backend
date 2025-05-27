import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelWrapper, connect } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NotifyEmailDto } from './dto/notify-email.dto';

@Injectable()
export class NotificationsConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationsConsumer.name);
  private readonly transporter: Transporter;
  private readonly queueName: string;
  private channel: ChannelWrapper;

  constructor(private readonly configService: ConfigService) {
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

    this.queueName = this.configService.getOrThrow<string>(
      'PROMO_NOTIFICATIONS_QUEUE',
    );

    const rabbitmqUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const connection = connect([rabbitmqUrl], { reconnectTimeInSeconds: 5 });

    connection.on('connect', () => this.logger.log('✅ Connected to RabbitMQ'));
    connection.on('disconnect', (params) =>
      this.logger.error('❌ Disconnected from RabbitMQ', params.err),
    );

    this.channel = connection.createChannel({
      json: false,
      setup: async (channel: Channel) =>
        channel.assertQueue(this.queueName, { durable: true }),
    });
  }

  onModuleInit() {
    void this.channel.consume(
      this.queueName,
      (message: ConsumeMessage | null): void => {
        if (!message) {
          return;
        }

        let payload: NotifyEmailDto;

        try {
          payload = JSON.parse(message.content.toString()) as NotifyEmailDto;
        } catch (err) {
          this.logger.error('❌ Invalid message format', err);
          this.channel.ack(message);
          return;
        }

        void this.transporter
          .sendMail({
            from: this.configService.getOrThrow<string>('SMTP_USER'),
            to: payload.email,
            subject: payload.subject,
            text: payload.text,
          })
          .then(() => {
            this.logger.log(`Email sent to ${payload.email}`);
            this.channel.ack(message);
          })
          .catch((err) => {
            this.logger.error('❌ Failed to send promo email', err);
            this.channel.nack(message, false, true);
          });
      },
      {
        noAck: false,
      },
    );

    this.logger.log(`Consumer listening on queue "${this.queueName}"`);
  }
}
