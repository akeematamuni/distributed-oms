import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { KAFKA_PRODUCER } from '@doms/shared/kafka';
import { IOutboxPublisherPort } from '../ports/outbox.publisher.port';

@Injectable()
export class OutboxPublisherAdapter implements OnModuleInit, OnModuleDestroy, IOutboxPublisherPort {
    constructor(@Inject(KAFKA_PRODUCER) private readonly client: ClientKafka) {}

    async onModuleInit() {
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.close();
    }

    async publish(topic: string, payload: Record<string, unknown>): Promise<void> {
        await lastValueFrom(this.client.emit(topic, payload));
    }
}
