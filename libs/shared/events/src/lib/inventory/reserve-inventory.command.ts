export interface ReserveInventoryCommandPayload {
    orderId: string;
    lines: Array<{ sku: string; quantity: number }>;
}

export interface ReserveInventoryCommand {
    eventId: string;
    eventType: 'inventory.commands.reserve';
    eventVersion: number;
    occurredAt: string;
    correlationId: string;
    payload: ReserveInventoryCommandPayload;
}
