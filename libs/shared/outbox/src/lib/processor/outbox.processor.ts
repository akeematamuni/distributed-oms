import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { IOutboxRepositoryPort, OUTBOX_REPOSITORY } from '../ports/outbox.repository.port';
import { IOutboxPublisherPort, OUTBOX_PUBLISHER } from '../ports/outbox.publisher.port';
import { OutboxRecord } from '../entity/outbox.entity';

@Injectable()
export class OutboxProcessor {
    private readonly logger = new Logger(OutboxProcessor.name);

    constructor(
        @Inject(DataSource) private readonly dataSource: DataSource,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(OUTBOX_REPOSITORY) private readonly repository: IOutboxRepositoryPort,
        @Inject(OUTBOX_PUBLISHER) private readonly publisher: IOutboxPublisherPort,
    ) {}

    /** Align raw data from databse to expected record shape */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    private mapToRecord(row: any): OutboxRecord {
        return {
            id: row.id,
            eventType: row.event_type,
            eventVersion: row.event_version,
            payload: row.payload,
            status: row.status,
            createdAt: row.created_at,
            publishedAt: row.published_at,
            retryCount: row.retry_count,
        };
    }

    @Cron(CronExpression.EVERY_SECOND)
    async process(): Promise<void> {
        const batchSize = this.configService.get('OUTBOX_BATCH_SIZE', 100);

        // Start a queryRunner to enable repository use SKIP LOCKED
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const rawPending = await this.repository.findPending(batchSize, queryRunner);
        const pending = rawPending.map(this.mapToRecord);

        if (pending.length < 1) {
            await queryRunner.commitTransaction();
            await queryRunner.release();
            return;
        }

        try {
            // Publish each record
            for (const record of pending) {
                try {
                    await this.publisher.publish(record.eventType, record.payload);
                    await this.repository.markPublished(record.id, queryRunner);
                } catch (error) {
                    this.logger.error(
                        `Failed to publish outbox record ${record.id} (${record.eventType}) | CorrelationId (${record.payload['correlationId']}) : ${error}`,
                    );
                    await this.repository.markFailed(record.id, queryRunner);
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            // If error were to occur outside of publishing
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
