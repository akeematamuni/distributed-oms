import { DomainEventBase } from '@doms/shared/kernel';

export class OrderCancelledEvent extends DomainEventBase {
    public readonly reason: string;

    constructor(orderId: string, reason: string, eventType = OrderCancelledEvent.name) {
        super(orderId, eventType);
        this.reason = reason;
    }
}
