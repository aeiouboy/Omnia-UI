import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { json, urlencoded } from 'body-parser';

import { AppModule } from './app.module';
import { AppConfigService } from './core/config/services';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  const logger = new Logger();
  
  const apiDocumentTitle = await configService.get('API_DOCUMENT_TITLE') || 'RIS OMS API';
  const apiDocumentDescription = await configService.get('API_DOCUMENT_DESCRIPTION') || 'Retail Intelligence System Order Management API';
  const apiDocumentVersion = await configService.get('API_DOCUMENT_VERSION') || '1.0.0';
  const apiDocumentPath = await configService.get('API_DOCUMENT_PATH') || '/docs';

  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Body parsing middleware
  app.use(
    json({ limit: await configService.get('APP_MAX_REQUEST_BODY_SIZE') || '10mb' }),
  );
  app.use(
    urlencoded({
      limit: await configService.get('APP_MAX_REQUEST_BODY_SIZE') || '10mb',
      extended: true,
    }),
  );

  // Swagger API Documentation
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(apiDocumentTitle)
    .setDescription(apiDocumentDescription)
    .setVersion(apiDocumentVersion)
    .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(apiDocumentPath, app, document);

  const port = Number(await configService.get('APP_PORT')) || 3001;
  const server = await app.listen(port);

  const timeout = Number(await configService.get('APP_TIMEOUT')) || 30;
  server.setTimeout(timeout * 60000);

  logger.log(`🚀 RIS OMS API Server running on port ${port}`, 'NestApplication');
  logger.log(`📖 API Documentation: http://localhost:${port}${apiDocumentPath}`, 'NestApplication');
}

void bootstrap();