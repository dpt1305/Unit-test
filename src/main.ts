import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as ServiceAccount from './../test-database-5c128-firebase-adminsdk-w9a37-a4d05389b4.config.json';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception.filter';
import * as functions from 'firebase-functions';

async function bootstrap() {
  const certification = {
    projectId: ServiceAccount.project_id,
    clientEmail: ServiceAccount.client_email,
    privateKey: ServiceAccount.private_key,
  };
  admin.initializeApp({
    credential: admin.credential.cert(certification),
  });

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('Unit test')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  // const api = functions.https.onRequest(app);
  await app.listen(3000);
}
bootstrap();
