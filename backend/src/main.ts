import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // 1. Global prefix
  app.setGlobalPrefix('api/v1');

  // 2. Validation pipe — strict mode
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const details = errors.map((e) => ({
          field: e.property,
          constraints: Object.values(e.constraints ?? {}),
        }));
        return new BadRequestException({
          message: 'Validation failed',
          details,
        });
      },
    }),
  );

  // 3. Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // 5. CORS
  const corsOrigin = process.env['CORS_ORIGIN'] || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // 6. Swagger — only in development
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Incident Management API')
      .setDescription('Real-time incident tracking and management')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs enabled at /api/docs');
  }

  // 7. Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
