import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { isAllowedCorsOrigin } from './config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const origins = new Set(
    config
      .getOrThrow<string>('CORS_ORIGINS')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) =>
      callback(null, isAllowedCorsOrigin(origin, origins)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  const swagger = new DocumentBuilder()
    .setTitle('Setta API')
    .setDescription('API do MVP Setta')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swagger),
  );
  await app.listen(config.get<number>('PORT') ?? 3000, '0.0.0.0');
}
void bootstrap();
