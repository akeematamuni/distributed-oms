export interface InventoryReservationFailedEventPayload {
    orderId: string;
    reason?: string;
}

export interface InventoryReservationFailedEvent {
    eventId: string;
    eventType: 'inventory.reservation.failed';
    eventVersion: number;
    occurredAt: string;
    correlationId: string;
    payload: InventoryReservationFailedEventPayload;
}
