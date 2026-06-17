export interface IOutboxPublisherPort {
    publish(topic: string, payload: Record<string, unknown>): Promise<void>;
}

export const OUTBOX_PUBLISHER = Symbol('OUTBOX_PUBLISHER');
