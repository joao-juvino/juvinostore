import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  
  app.use(bodyParser.json({
    verify: (req: any, _, buf) => {
      req.rawBody = buf;
    },
  }));

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
