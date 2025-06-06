import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  DatabaseModule,
  HealthModule,
  LoggerModule,
  SERVICE,
} from '@app/common';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { DetailsModule } from './details/details.module';
import { Detail } from './details/entities/detail.entity';
import { Product } from './entities/product.entity';
import { Image } from './images/entities/image.entity';
import { ImagesModule } from './images/images.module';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { Specification } from './specifications/entities/specification.entity';
import { SpecificationsModule } from './specifications/specifications.module';

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

        CORS_ORIGIN: Joi.string().required(),

        AUTH_GRPC_URL: Joi.string().required(),

        RABBITMQ_RPC_URL: Joi.string().required(),
        RABBITMQ_RPC_QUEUE: Joi.string().required(),

        HTTP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../../proto/auth.proto'),
            url: config.getOrThrow<string>('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: SERVICE.NOTIFICATIONS,
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_RPC_URL')],
            queue: config.getOrThrow<string>('RABBITMQ_RPC_QUEUE'),
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'schemas/schema-products.gql'),
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [Product, Image, Detail, Specification, Category],
      },
    }),
    DatabaseModule,
    DatabaseModule.forFeature([Product]),
    ImagesModule,
    SpecificationsModule,
    DetailsModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsResolver],
})
export class ProductsModule {}
