import { Test, TestingModule } from '@nestjs/testing';
import { INVENTORY_REPOSITORY } from '@doms/inventory/domain';
import { GetAvailabilityHandler } from './get-availability.handler';
import { GetAvailabilityQuery } from './get-availability.query';

const mockInventoryRepository = { findBySku: jest.fn() };

const makeNode = (nodeId: string, onHand: number, reserved: number) => ({
    nodeId,
    sku: 'WIDGET-1234',
    available: { value: onHand - reserved },
    onHand: { value: onHand },
    reserved: { value: reserved },
});

const query = new GetAvailabilityQuery('WIDGET-1234', '1dba4f6f-6ba7-498e-9eea-c00db5761546');

describe('GetAvailabilityHandler', () => {
    let handler: GetAvailabilityHandler;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetAvailabilityHandler,
                { provide: INVENTORY_REPOSITORY, useValue: mockInventoryRepository },
            ],
        }).compile();

        handler = module.get(GetAvailabilityHandler);
    });

    afterEach(() => jest.clearAllMocks());

    it('should return null when no inventory nodes exist for sku', async () => {
        mockInventoryRepository.findBySku.mockResolvedValue([]);
        const result = await handler.execute(query);

        expect(result).toBeNull();
    });

    it('should aggregate available quantity across all nodes', async () => {
        mockInventoryRepository.findBySku.mockResolvedValue([
            makeNode('node-001', 10, 3),
            makeNode('node-002', 20, 5),
        ]);

        const result = await handler.execute(query);

        expect(result!.totalAvailable).toBe(22);
        expect(result!.nodes).toHaveLength(2);
    });

    it('should return correct sku from first node', async () => {
        mockInventoryRepository.findBySku.mockResolvedValue([makeNode('node-001', 10, 0)]);
        const result = await handler.execute(query);

        expect(result!.sku).toBe('WIDGET-1234');
    });

    it('should return zero totalAvailable when all nodes are fully reserved', async () => {
        mockInventoryRepository.findBySku.mockResolvedValue([
            makeNode('node-001', 5, 5),
            makeNode('node-002', 10, 10),
        ]);

        const result = await handler.execute(query);

        expect(result!.totalAvailable).toBe(0);
    });

    it('should include per-node breakdown in response', async () => {
        mockInventoryRepository.findBySku.mockResolvedValue([
            makeNode('node-001', 10, 2),
            makeNode('node-002', 8, 3),
        ]);

        const result = await handler.execute(query);

        expect(result!.nodes).toEqual([
            { nodeId: 'node-001', available: 8 },
            { nodeId: 'node-002', available: 5 },
        ]);
    });
});
