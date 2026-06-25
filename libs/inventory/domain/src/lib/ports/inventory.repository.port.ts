import { InventoryNode } from '../aggregates/inventory-node.aggregate';

export interface IInventoryRepositoryPort {
    save(inventoryNode: InventoryNode): Promise<void>;
    findBySkuAndNode(sku: string, nodeId: string): Promise<InventoryNode | null>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
