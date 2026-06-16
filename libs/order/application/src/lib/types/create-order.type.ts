import { AddressInput } from './address.type';
import { OrderLineInput } from './order-line.type';

export interface CreateOrderInput {
    customerId: string;
    channel: string;
    shippingAddress: AddressInput;
    lines: OrderLineInput[];
}
