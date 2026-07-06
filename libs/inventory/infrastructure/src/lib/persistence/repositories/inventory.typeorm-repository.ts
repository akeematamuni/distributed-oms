import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { InventoryNode, IInventoryRepositoryPort } from '@doms/inventory/domain';
import { InventoryNodeTypeOrmEntity } from '../entities/inventory-node.typeorm-entity';
import { InventoryMapper } from '../mappers/inventory.mapper';

@Injectable()
export class InventoryTypeOrmRepository implements IInventoryRepositoryPort {
    constructor(
        @InjectRepository(InventoryNodeTypeOrmEntity)
        private readonly repository: Repository<InventoryNodeTypeOrmEntity>,
    ) {}

    private getRepository(queryRunner?: unknown): Repository<InventoryNodeTypeOrmEntity> {
        if (queryRunner && typeof queryRunner === 'object' && 'manager' in queryRunner) {
            const qr = queryRunner as QueryRunner;
            return qr.manager.getRepository(InventoryNodeTypeOrmEntity);
        }

        return this.repository;
    }

    async save(inventoryNode: InventoryNode, queryRunner: unknown): Promise<void> {
        const entity = InventoryMapper.toPersistence(inventoryNode);
        const repo = this.getRepository(queryRunner);
        await repo.save(entity);
    }

    async findBySkuAndNode(sku: string, nodeId: string): Promise<InventoryNode | null> {
        const repo = this.getRepository();
        const inventoryNode = await repo.findOne({
            where: { sku, nodeId },
            relations: { reservations: true },
        });
        return inventoryNode ? InventoryMapper.toDomain(inventoryNode) : null;
    }

    async findBySku(sku: string): Promise<InventoryNode[]> {
        const repo = this.getRepository();
        const inventoryNodes = await repo.find({ where: { sku } });
        return inventoryNodes.map((i) => InventoryMapper.toDomain(i));
    }
}
