import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const server = express();
let cachedApp: express.Express | null = null;

export async function createApp(): Promise<express.Express> {
  if (cachedApp) return cachedApp;

  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] },
  );

  nestApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  nestApp.useGlobalFilters(new HttpExceptionFilter());

  nestApp.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  nestApp.setGlobalPrefix('api', { exclude: ['health'] });

  await nestApp.init();
  cachedApp = server;
  return cachedApp;
}
