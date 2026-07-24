export interface InventoryNodeSeedProps {
    id?: string;
    sku: string;
    nodeId: string;
    onHand: number;
}

/**
 * Local dev seed data.
 * nodeId values here are fixed UUIDs so re-seeding is deterministic and
 * so apps/inventory's GetAvailabilityService has stable, known nodes to hit.
 */
export const INVENTORY_NODE_SEED: InventoryNodeSeedProps[] = [
    { sku: 'WIDGET-0001', nodeId: 'fc1c68fa-b788-4436-bd82-236264188762', onHand: 100 },
    { sku: 'WIDGET-0002', nodeId: '6d99ab62-6510-4348-b74f-aea4d9e8c622', onHand: 50 },
    { sku: 'GADGET-0001', nodeId: 'c0cb43bf-1d36-42b5-86a3-2624bee97bde', onHand: 0 },
    { sku: 'GADGET-0002', nodeId: '3047d1d7-59b8-4a0e-ae55-0e667b2fd795', onHand: 25 },
];
