import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { config } from 'dotenv';

import { baseLogger } from '@doms/shared/utils';
import { AppModule } from './app/app.module';

config();

async function bootstrap() {
    const winstonLogger = WinstonModule.createLogger({ instance: baseLogger });
    const app = await NestFactory.create(AppModule, { logger: winstonLogger, bufferLogs: true });

    // const app = await NestFactory.create(AppModule);

    const logger = new Logger('Order-Capture');
    const config = app.get(ConfigService);
    const globalPrefix = config.get('GLOBAL_PREFIX');
    const port = config.get('ORDER_CAPTURE_PORT', 3001);

    // Setup validation pipe

    app.setGlobalPrefix(globalPrefix);

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Distributed Order Management System')
        .setDescription(
            'Developed with DDD + EDA + Hexagonal Architecture + CQRS\n\nMade with ❤️ by Emmanuel Amuni',
        )
        .setVersion('1.0.0')
        .build();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    try {
        const document = SwaggerModule.createDocument(app, swaggerConfig);
        SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                operationsSorter: 'alpha',
                tagsSorter: 'alpha',
            },
            customSiteTitle: 'Order Capture Service',
        });
    } catch (error: any) {
        console.error('Swagger failed on:', error.message);
        console.error(error.stack);
    }

    await app.listen(port);

    logger.log(`Order-Capture is running on: http://localhost:${port}/${globalPrefix}`);
    console.log(`Order-Capture is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
