import { InventoryNode } from '../aggregates/inventory-node.aggregate';

export interface IInventoryRepositoryPort {
    // findBySku(sku: string): Promise<InventoryNode[]>;
    findBySkus(skus: string[]): Promise<Map<string, InventoryNode[]>>;
    save(inventoryNode: InventoryNode, queryRunner: unknown): Promise<void>;
    findBySkusAndNodes(items: { sku: string; nodeId: string }[]): Promise<InventoryNode[]>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
