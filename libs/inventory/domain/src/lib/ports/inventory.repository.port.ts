import { InventoryNode } from '../aggregates/inventory-node.aggregate';

export interface IInventoryRepositoryPort {
    findBySku(sku: string): Promise<InventoryNode[]>;
    save(inventoryNode: InventoryNode, queryRunner: unknown): Promise<void>;
    findBySkuAndNode(sku: string, nodeId: string): Promise<InventoryNode | null>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
