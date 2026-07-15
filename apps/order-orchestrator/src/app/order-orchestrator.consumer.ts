import { Consumer, EachMessagePayload } from 'kafkajs';
import { OnModuleInit, OnModuleDestroy, Inject, Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderSaga } from '@doms/order/application';
import { createKafkaConsumer } from '@doms/shared/kafka';

@Injectable()
export class OrderOrchestratorConsumer implements OnModuleInit, OnModuleDestroy {
    private consumer: Consumer;
    private readonly logger = new Logger(OrderOrchestratorConsumer.name);

    constructor(
        @Inject(OrderSaga) private readonly saga: OrderSaga,
        @Inject(ConfigService) private readonly config: ConfigService,
    ) {}

    /** Logic to apply to each message consumer receives */
    private async handleMessage({ topic, message }: EachMessagePayload): Promise<void> {
        if (!message.value) {
            this.logger.warn(`This topic (${topic}) has no message`);
            return;
        }

        try {
            const payload = JSON.parse(message.value.toString());

            switch (topic) {
                case 'inventory.reservation.succeeded':
                    await this.saga.onInventoryReservationSucceeded(payload);
                    break;

                case 'inventory.reservation.failed':
                    await this.saga.onInventoryReservationFailed(payload);
                    break;

                default:
                    this.logger.warn(`There is no consumer for this topic: ${topic}`);
            }
        } catch (error) {
            this.logger.error(`Error occured while handling topic ${topic}: ${error}`);
            // To be handled later in DLQ
        }
    }

    async onModuleInit(): Promise<void> {
        this.consumer = await createKafkaConsumer(
            {
                clientId: 'order-orchestrator',
                brokers: this.config.get('KAFKA_BROKERS').split(','),
                groupId: 'doms.order-orchestrator',
                topics: ['inventory.reservation.succeeded', 'inventory.reservation.failed'],
            },
            this.handleMessage.bind(this),
        );
    }

    async onModuleDestroy(): Promise<void> {
        await this.consumer.disconnect();
    }
}
