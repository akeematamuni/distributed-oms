import { randomUUID } from 'node:crypto';

export abstract class DomainEventBase {
    public readonly eventId: string;
    public readonly aggregateId: string;
    public readonly occurredAt: Date;
    public readonly eventVersion: number;
    public readonly eventType: string;

    constructor(aggregateId: string, eventType: string, eventVersion = 1) {
        this.eventId = randomUUID();
        this.aggregateId = aggregateId;
        this.occurredAt = new Date();
        this.eventVersion = eventVersion;
        this.eventType = eventType;
    }
}
