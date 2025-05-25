import { IntrospectAndCompose } from '@apollo/gateway';
import { HealthModule, LoggerModule } from '@app/common';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import * as Joi from 'joi';

@Module({
  imports: [
    LoggerModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),

        PRODUCTS_GRAPHQL_URL: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      imports: [ConfigModule],
      driver: ApolloGatewayDriver,
      useFactory: (config: ConfigService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: 'products',
                url: config.getOrThrow('PRODUCTS_GRAPHQL_URL'),
              },
            ],
            subgraphHealthCheck: true,
            pollIntervalInMs: 10000,
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
