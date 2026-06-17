import { DomainEventBase } from '@doms/shared/kernel';
import { Address } from '../value-objects/address.vo';
import { Money } from '../value-objects/money.vo';
import { OrderLine } from '../entities/order-line.entity';

export class OrderCreatedEvent extends DomainEventBase {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        public readonly channel: string,
        public readonly shippingAddress: Address,
        public readonly totalAmount: Money,
        public readonly lines: OrderLine[],
    ) {
        super(orderId, OrderCreatedEvent.name);
    }
}
