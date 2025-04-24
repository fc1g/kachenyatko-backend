import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ProductsModule } from './products.module';

void (async function bootstrap() {
  const app = await NestFactory.create(ProductsModule);
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  await app.listen(config.getOrThrow<number>('HTTP_PORT'));
})();
