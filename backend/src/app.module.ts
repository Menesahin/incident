import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Incident } from './modules/incident/entities/incident.entity';
import { IncidentTimeline } from './modules/incident/entities/incident-timeline.entity';
import { HealthModule } from './modules/health/health.module';
import { IncidentModule } from './modules/incident/incident.module';
import { QUEUE_RETRY_ATTEMPTS } from './common/constants/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [Incident, IncidentTimeline],
        synchronize: config.get('NODE_ENV') === 'development',
        logging:
          config.get('NODE_ENV') === 'development'
            ? (['query', 'error'] as const)
            : (['error'] as const),
        maxQueryExecutionTime: 1000,
        extra: {
          max: 20,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        },
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.getOrThrow<string>('REDIS_URL'));
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port) || 6379,
            ...(redisUrl.password ? { password: redisUrl.password } : {}),
            ...(redisUrl.username ? { username: redisUrl.username } : {}),
          },
          defaultJobOptions: {
            attempts: QUEUE_RETRY_ATTEMPTS,
            backoff: { type: 'exponential' as const, delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        };
      },
    }),

    HealthModule,
    IncidentModule,
  ],
})
export class AppModule {}
