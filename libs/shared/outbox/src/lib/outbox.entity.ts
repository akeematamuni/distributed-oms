export enum OutboxStatus {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
    FAILED = 'FAILED',
}

export interface OutboxRecord {
    id: string;
    eventType: string;
    eventVersion: number;
    payload: Record<string, unknown>;
    status: OutboxStatus;
    createdAt: Date;
    publishedAt: Date | null;
    retryCount: number;
}
