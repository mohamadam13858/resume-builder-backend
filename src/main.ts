import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'https://your-production-domain.com', 
      'https://*.your-domain.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization', 'Set-Cookie'],
    credentials: true,
    maxAge: 3600,
  });

  const config = new DocumentBuilder()
    .setTitle('Resume Builder API')
    .setDescription('API for Resume Builder')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('resumes')
    .addTag('templates')
    .addTag('public')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
    .addCookieAuth('token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, { swaggerOptions: { persistAuthorization: true } });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 http://localhost:${port}`);
  console.log(`📚 http://localhost:${port}/api`);
}

bootstrap();