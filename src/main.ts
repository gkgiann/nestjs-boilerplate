import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS Configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || '*';
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  console.log(`📦 Environment: ${nodeEnv}`);
  console.log(
    `🔒 CORS Origins: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : corsOrigins}`,
  );
}
void bootstrap();
