export interface InventoryReservedEventPayload {
    reservationId: string;
    orderId: string;
    lines: Array<{
        sku: string;
        quantity: number;
        nodeId: string;
    }>;
    reservedAt: string;
    correlationId: string;
}

export interface InventoryReservedEvent {
    eventId: string;
    eventType: 'inventory.reservation.succeeded';
    eventVersion: 1;
    occurredAt: string;
    correlationId: string;
    payload: InventoryReservedEventPayload;
}
