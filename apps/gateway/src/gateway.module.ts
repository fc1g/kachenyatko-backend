import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import {
  AUTH_SERVICE_NAME,
  AuthenticationHeaderRequest,
  HealthModule,
  LoggerModule,
} from '@app/common';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { join } from 'path';

@Module({
  imports: [
    LoggerModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PRODUCTS_GRAPHQL_URL: Joi.string().required(),

        AUTH_GRPC_URL: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_NAME,
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'auth',
            protoPath: join(__dirname, '../../../proto/auth.proto'),
            url: config.getOrThrow('AUTH_GRPC_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: (config: ConfigService) => ({
        server: {
          context: ({ req }: { req: AuthenticationHeaderRequest }) => ({
            Authentication: req.headers?.authentication,
          }),
        },
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
          buildService({ url }) {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                request.http?.headers.set(
                  'authentication',
                  (context?.Authentication as string) || '',
                );
              },
            });
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
