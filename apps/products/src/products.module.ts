import { DatabaseModule, LoggerModule } from '@app/common';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import * as Joi from 'joi';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        TYPEORM_HOST: Joi.string().required(),
        TYPEORM_PORT: Joi.number().required(),
        TYPEORM_USERNAME: Joi.string().required(),
        TYPEORM_PASSWORD: Joi.string().required(),
        TYPEORM_DATABASE: Joi.string().required(),
        TYPEORM_SYNCHRONIZE: Joi.boolean().required(),

        HTTP_PORT: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    LoggerModule,
    ProductsModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class ProductsModule {}
