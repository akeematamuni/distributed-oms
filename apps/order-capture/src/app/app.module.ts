import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedUtilsModule } from '@doms/shared/utils';
import { SharedRedisModule } from '@doms/shared/redis';

import {
    OrderTypeOrmEntity,
    OrderLineTypeOrmEntity,
    OrderOutboxTypeOrmEntity,
} from '@doms/order/infrastructure';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        SharedUtilsModule,
        SharedRedisModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                url: config.get('ORDER_DB_URL'),
                entities: [OrderTypeOrmEntity, OrderLineTypeOrmEntity, OrderOutboxTypeOrmEntity],
                synchronize: false,
            }),
        }),
        TypeOrmModule.forFeature([
            OrderTypeOrmEntity,
            OrderLineTypeOrmEntity,
            OrderOutboxTypeOrmEntity,
        ]),
    ],
    providers: [
        AppService,
        // Order domain and infrastructure layer imports,
        // Order application layer imports,
    ],
    controllers: [AppController],
})
export class AppModule {}
