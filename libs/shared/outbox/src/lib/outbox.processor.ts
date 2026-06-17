import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { IOutboxRepositoryPort, OUTBOX_REPOSITORY } from './outbox.repository.port';
import { IOutboxPublisherPort, OUTBOX_PUBLISHER } from './outbox.publisher.port';

@Injectable()
export class OutboxProcessor {
    private readonly logger = new Logger(OutboxProcessor.name);

    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(OUTBOX_REPOSITORY) private readonly repository: IOutboxRepositoryPort,
        @Inject(OUTBOX_PUBLISHER) private readonly publisher: IOutboxPublisherPort,
    ) {}

    @Cron(CronExpression.EVERY_SECOND)
    async process(): Promise<void> {
        const batchSize = this.configService.get('OUTBOX_BATCH_SIZE', 100);
        const pending = await this.repository.findPending(batchSize);

        for (const record of pending) {
            try {
                await this.publisher.publish(record.eventType, record.payload);
                await this.repository.markPublished(record.id);
            } catch (error) {
                this.logger.error(
                    `Failed to publish outbox record ${record.id} (${record.eventType}): ${error}`,
                );
                await this.repository.markFailed(record.id);
            }
        }
    }
}
