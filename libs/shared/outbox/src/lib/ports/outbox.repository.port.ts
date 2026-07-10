import { OutboxRecord } from '../entity/outbox.entity';

// An active queryRunner (transaction started) must be provided
export interface IOutboxRepositoryPort {
    save(
        record: Omit<OutboxRecord, 'createdAt' | 'publishedAt' | 'retryCount'>,
        queryRunner: unknown,
    ): Promise<void>;
    findPending(limit: number, queryRunner: unknown): Promise<OutboxRecord[]>;
    markPublished(id: string, queryRunner: unknown): Promise<void>;
    markFailed(id: string, queryRunner: unknown): Promise<void>;
}

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');
