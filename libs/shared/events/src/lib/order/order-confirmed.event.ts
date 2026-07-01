export interface OrderConfirmedEventPayload {
    orderId: string;
}

export interface OrderConfirmedEvent {
    eventId: string;
    eventType: 'order.confirmed';
    eventVersion: number;
    occurredAt: string;
    correlationId: string;
    payload: OrderConfirmedEventPayload;
}
