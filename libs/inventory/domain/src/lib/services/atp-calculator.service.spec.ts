import { SKU, UniqueId } from '@doms/shared/kernel';
import { InventoryNode } from '../aggregates/inventory-node.aggregate';
import { Quantity } from '../value-objects/quantity.value-object';
import { AtpCalculatorService } from './atp-calculator.service';

describe('AtpCalculatorService', () => {
    const makeInventoryNode = (onHand: number) =>
        InventoryNode.create({
            sku: SKU.create('WIDGET-1234').value,
            onHand: Quantity.create(onHand).value,
            nodeId: UniqueId.create().value,
        });

    const reservationId = () => UniqueId.create().value;
    const orderId = () => UniqueId.create().value;

    it('should return full onHand when nothing is reserved', () => {
        expect(AtpCalculatorService.calculate(makeInventoryNode(20)).value).toBe(20);
    });

    it('should return zero when fully reserved', () => {
        const node = makeInventoryNode(5);
        node.reserve(reservationId(), orderId(), Quantity.create(5));
        expect(AtpCalculatorService.calculate(node).value).toBe(0);
    });

    it('should return remaining available after partial reservation', () => {
        const node = makeInventoryNode(10);
        node.reserve(reservationId(), orderId(), Quantity.create(5));
        expect(AtpCalculatorService.calculate(node).value).toBe(5);
    });
});
