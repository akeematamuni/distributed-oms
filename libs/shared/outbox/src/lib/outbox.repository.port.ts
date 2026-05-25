import { OutboxRecord } from './outbox.entity';

export interface OutboxRepositoryPort {
    save(
        record: Omit<OutboxRecord, 'id' | 'createdAt' | 'publishedAt' | 'retryCount'>,
    ): Promise<void>;
    findPending(limit: number): Promise<OutboxRecord[]>;
    markPublished(id: string): Promise<void>;
    markFailed(id: string): Promise<void>;
}

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');
