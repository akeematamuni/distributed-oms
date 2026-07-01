export interface OrderCancelledEventPayload {
    orderId: string;
    reason: string;
}

export interface OrderCancelledEvent {
    eventId: string;
    eventType: 'order.cancelled';
    eventVersion: number;
    occurredAt: string;
    correlationId: string;
    payload: OrderCancelledEventPayload;
}
