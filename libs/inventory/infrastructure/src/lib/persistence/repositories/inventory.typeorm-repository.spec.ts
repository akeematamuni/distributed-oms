import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryTypeOrmRepository } from './inventory.typeorm-repository';
import { InventoryNodeTypeOrmEntity } from '../entities/inventory-node.typeorm-entity';
import { InventoryMapper } from '../mappers/inventory.mapper';
import { QueryRunner } from 'typeorm';

const makeEntity = (): InventoryNodeTypeOrmEntity => {
    const entity = new InventoryNodeTypeOrmEntity();
    entity.id = 'node-agg-id';
    entity.sku = 'WIDGET-1234';
    entity.nodeId = 'node-001';
    entity.onHand = 50;
    entity.reserved = 0;
    entity.version = 1;
    entity.reservations = [];
    return entity;
};

const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
};

const mockQrRepository = {
    save: jest.fn(),
    find: jest.fn(),
};

const mockQueryRunner = {
    manager: {
        getRepository: jest.fn().mockReturnValue(mockQrRepository),
    },
} as unknown as QueryRunner;

describe('InventoryTypeOrmRepository', () => {
    let repository: InventoryTypeOrmRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryTypeOrmRepository,
                {
                    provide: getRepositoryToken(InventoryNodeTypeOrmEntity),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        repository = module.get(InventoryTypeOrmRepository);
    });

    afterEach(() => jest.clearAllMocks());

    describe('findBySkusAndNodes', () => {
        it('should return domain aggregates when found', async () => {
            mockRepository.find.mockResolvedValue([makeEntity()]);

            const results = await repository.findBySkusAndNodes([
                { sku: 'WIDGET-1234', nodeId: 'node-001' },
            ]);

            expect(results).toHaveLength(1);
            expect(results[0].sku).toBe('WIDGET-1234');
            expect(results[0].nodeId).toBe('node-001');
        });

        it('should return empty array when none found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const results = await repository.findBySkusAndNodes([
                { sku: 'WIDGET-1234', nodeId: 'node-001' },
            ]);

            expect(results).toHaveLength(0);
        });

        it('should query with correct where clause and relations', async () => {
            mockRepository.find.mockResolvedValue([]);

            const items = [{ sku: 'WIDGET-1234', nodeId: 'node-001' }];
            await repository.findBySkusAndNodes(items);

            expect(mockRepository.find).toHaveBeenCalledWith({
                where: items,
                relations: { reservations: true },
            });
        });
    });

    describe('findBySkus', () => {
        it('should return a map grouped by SKU when nodes are found', async () => {
            mockRepository.find.mockResolvedValue([makeEntity()]);

            const resultMap = await repository.findBySkus(['WIDGET-1234']);

            expect(resultMap.size).toBe(1);
            expect(resultMap.get('WIDGET-1234')).toHaveLength(1);
        });

        it('should return empty map when no nodes found', async () => {
            mockRepository.find.mockResolvedValue([]);

            const resultMap = await repository.findBySkus(['WIDGET-1234']);

            expect(resultMap.size).toBe(0);
        });

        it('should query with correct where clause for SKUs', async () => {
            mockRepository.find.mockResolvedValue([]);

            await repository.findBySkus(['WIDGET-1234']);

            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('save', () => {
        it('should persist using injected repository when no queryRunner provided', async () => {
            const entity = makeEntity();
            const domain = InventoryMapper.toDomain(entity);
            mockRepository.save.mockResolvedValue(undefined);

            await repository.save(domain, undefined);

            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('should use queryRunner manager repository when provided', async () => {
            const entity = makeEntity();
            const domain = InventoryMapper.toDomain(entity);
            mockQrRepository.save.mockResolvedValue(undefined);

            await repository.save(domain, mockQueryRunner);

            expect(mockQrRepository.save).toHaveBeenCalled();
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
    });
});
