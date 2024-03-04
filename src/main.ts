import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new Logger(),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: [
      'https://naveed-blogs.netlify.com',
      'https://blog-1-server-7d4o.vercel.app',
      'http://localhost:5173',
    ],
  });

  app.setGlobalPrefix('api');
  const PORT = process.env.PORT! || 8000;
  await app.listen(PORT);
}

bootstrap();
