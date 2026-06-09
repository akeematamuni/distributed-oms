import { DomainEventBase } from '@doms/shared/kernel';

export class OrderConfirmedEvent extends DomainEventBase {
    constructor(orderId: string, eventType = OrderConfirmedEvent.name) {
        super(orderId, eventType);
    }
}
