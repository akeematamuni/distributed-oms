import { randomUUID } from 'node:crypto';

export abstract class CommandBase {
    public readonly correlationId: string;

    protected constructor(correlationId?: string) {
        this.correlationId = correlationId ?? randomUUID();
    }
}
