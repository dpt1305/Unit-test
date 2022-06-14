import * as functions from "firebase-functions";
// import * as functions from 'firebase-functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from "./app.module";
import * as admin from 'firebase-admin';
import * as ServiceAccount from './../test-database-5c128-firebase-adminsdk-w9a37-a4d05389b4.config.json';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const randomNumber = functions.https.onRequest((req, res) => {
  const randomNumber = Math.random().toString();
  res.send(randomNumber);
});

const certification = {
  projectId: ServiceAccount.project_id,
  clientEmail: ServiceAccount.client_email,
  privateKey: ServiceAccount.private_key,
};
admin.initializeApp({
  credential: admin.credential.cert(certification),
});
const server = express();

const createNestServer = async (expressInstance) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('Unit test')
    .addServer('https://us-central1-zporter-trial-1234.cloudfunctions.net/api/')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  return app.init();
};
createNestServer(server)
  .then((v) => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

export const api = functions.https.onRequest(server);
// export { api } from './../api';
