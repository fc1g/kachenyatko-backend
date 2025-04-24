import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('TYPEORM_HOST'),
        port: config.getOrThrow<number>('TYPEORM_PORT'),
        username: config.getOrThrow<string>('TYPEORM_USERNAME'),
        password: config.getOrThrow<string>('TYPEORM_PASSWORD'),
        database: config.getOrThrow<string>('TYPEORM_DATABASE'),
        synchronize: config.getOrThrow<boolean>('TYPEORM_SYNCHRONIZE'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forFeature(entities: EntityClassOrSchema[]) {
    return TypeOrmModule.forFeature(entities);
  }
}
