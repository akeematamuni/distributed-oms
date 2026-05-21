export interface OrderCreatedEventPayload {
    orderId: string;
    customerId: string;
    channel: string;
    lines: Array<{
        skuId: string;
        quantity: number;
        unitPrice: number;
        currency: string;
    }>;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    totalAmount: number;
    currency: string;
}

export interface OrderCreatedEvent {
    eventId: string;
    eventType: 'order.created';
    eventVersion: 1;
    occurredAt: string;
    correlationId: string;
    payload: OrderCreatedEventPayload;
}
