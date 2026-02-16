import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Definir logger Pino como padrão
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // Prefixo Global
  app.setGlobalPrefix('api/v1');

  // Validation Pipe Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Interceptors Globais
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Exception Filter Global
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Configuração CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS')?.split(',') || '*';
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription(
      'API de exemplo para NestJS com boas práticas de configuração, segurança e documentação.',
    )
    .setVersion('v1')
    .addTag('Autenticação', 'Endpoints de autenticação e gerenciamento de usuários')
    .addTag('Health', 'Endpoints de saúde da aplicação')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT obtido no login',
      name: 'Authorization',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  logger.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
  logger.log(`📦 Environment: ${nodeEnv}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  logger.log(
    `🔒 CORS Origins: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : corsOrigins}`,
  );
}
void bootstrap();
