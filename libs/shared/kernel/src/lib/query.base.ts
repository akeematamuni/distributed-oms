import { randomUUID } from 'node:crypto';

export abstract class QueryBase {
    public readonly correlationId: string;

    protected constructor(correlationId?: string) {
        this.correlationId = correlationId ?? randomUUID();
    }
}
