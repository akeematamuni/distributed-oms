export interface OrderCreatedEventPayload {
    orderId: string;
    lines: Array<{ sku: string; quantity: number }>;
}

export interface OrderCreatedEvent {
    eventId: string;
    eventType: 'order.created';
    eventVersion: number;
    occurredAt: string;
    correlationId: string;
    payload: OrderCreatedEventPayload;
}
