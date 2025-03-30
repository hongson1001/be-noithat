import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: '*',
  });

  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'public', 'uploads')),
  );
  app.use(bodyParser.json({ limit: '1000mb' }));
  app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));

  await app.listen(process.env.API_PORT, '0.0.0.0');
}
bootstrap();
