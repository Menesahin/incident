import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Incident } from '../modules/incident/entities/incident.entity';
import { IncidentTimeline } from '../modules/incident/entities/incident-timeline.entity';

export const databaseConfigFactory = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: config.getOrThrow<string>('DATABASE_URL'),
  entities: [Incident, IncidentTimeline],
  synchronize: config.get('NODE_ENV') === 'development',
  logging:
    config.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
  maxQueryExecutionTime: 1000,
  extra: {
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  },
});
