import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { NotificationsModule } from './notifications.module';

void (async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
      queue: configService.getOrThrow<string>('RABBITMQ_QUEUE'),
      queueOptions: {
        noAck: false,
        durable: true,
      },
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
})();
