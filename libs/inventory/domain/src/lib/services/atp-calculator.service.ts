import { InventoryNode } from '../aggregates/inventory-node.aggregate';
import { Quantity } from '../value-objects/quantity.value-object';

export class AtpCalculatorService {
    static calculate(inventoryNode: InventoryNode): Quantity {
        return inventoryNode.available;
    }
}
