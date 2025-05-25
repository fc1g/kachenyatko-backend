import { DatabaseModule, HealthModule, LoggerModule } from '@app/common';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { DetailsModule } from './details/details.module';
import { Detail } from './details/entities/detail.entity';
import { Product } from './entities/product.entity';
import { Image } from './images/entities/image.entity';
import { ImagesModule } from './images/images.module';
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

        AUTH_HOST: Joi.string().required(),
        AUTH_PORT: Joi.number().required(),

        HTTP_PORT: Joi.number().required(),
      }),
    }),
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
  controllers: [],
  providers: [ProductsService, ProductsRepository, ProductsResolver],
})
export class ProductsModule {}
