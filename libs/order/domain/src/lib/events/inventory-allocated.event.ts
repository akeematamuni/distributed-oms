import { DomainEventBase } from '@doms/shared/kernel';

export class InventoryAllocatedEvent extends DomainEventBase {
    public readonly reservationId: string;

    constructor(orderId: string, reservationId: string, eventType = InventoryAllocatedEvent.name) {
        super(orderId, eventType);
        this.reservationId = reservationId;
    }
}
