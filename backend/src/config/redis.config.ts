import { ConfigService } from '@nestjs/config';
import { QUEUE_RETRY_ATTEMPTS } from '../common/constants/index';

export const redisConfigFactory = (config: ConfigService) => {
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
};
