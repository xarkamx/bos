import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ConfigModule } from '@nestjs/config';
import { db } from './config/db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
