import { DomainEventBase } from '@doms/shared/kernel';
import { Address } from '../value-objects/address.vo';
import { Money } from '../value-objects/money.vo';
import { OrderLine } from '../entities/order-line.entity';

export class OrderCreatedEvent extends DomainEventBase {
    public readonly customerId: string;
    public readonly shippingAddress: Address;
    public readonly channel: string;
    public readonly totalAmount: Money;
    public readonly lines: OrderLine[];

    constructor(
        orderId: string,
        customerId: string,
        shippingAddress: Address,
        channel: string,
        totalAmount: Money,
        lines: OrderLine[],
        eventType = OrderCreatedEvent.name,
    ) {
        super(orderId, eventType);
        this.customerId = customerId;
        this.shippingAddress = shippingAddress;
        this.channel = channel;
        this.totalAmount = totalAmount;
        this.lines = lines;
    }
}
