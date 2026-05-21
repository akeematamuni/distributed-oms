export interface OrderCancelledEventPayload {
    orderId: string;
    reason: string;
    cancelledAt: string;
}

export interface OrderCancelledEvent {
    eventId: string;
    eventType: 'order.cancelled';
    eventVersion: 1;
    occurredAt: string;
    correlationId: string;
    payload: OrderCancelledEventPayload;
}
