export interface InventoryReservedEventPayload {
    reservationId: string;
    orderId: string;
    lines: Array<{
        skuId: string;
        quantity: number;
        nodeId: string;
    }>;
    reservedAt: Date;
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
