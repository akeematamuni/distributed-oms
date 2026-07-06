import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { IOutboxRepositoryPort, OutboxRecord, OutboxStatus } from '@doms/shared/outbox';
import { InventoryOutboxTypeOrmEntity } from '../entities/inventory-outbox.typeorm-entity';

@Injectable()
export class InventoryOutboxTypeOrmRepository implements IOutboxRepositoryPort {
    constructor(
        @InjectRepository(InventoryOutboxTypeOrmEntity)
        private readonly repository: Repository<InventoryOutboxTypeOrmEntity>,
    ) {}

    private getRepository(queryRunner?: unknown): Repository<InventoryOutboxTypeOrmEntity> {
        if (queryRunner && typeof queryRunner === 'object' && 'manager' in queryRunner) {
            const qr = queryRunner as QueryRunner;
            return qr.manager.getRepository(InventoryOutboxTypeOrmEntity);
        }

        return this.repository;
    }

    async save(
        record: Omit<OutboxRecord, 'createdAt' | 'publishedAt' | 'retryCount'>,
        queryRunner?: unknown,
    ): Promise<void> {
        await this.getRepository(queryRunner).save(record);
    }

    async findPending(limit: number, queryRunner?: unknown): Promise<OutboxRecord[]> {
        return await this.getRepository(queryRunner).find({
            where: { status: OutboxStatus.PENDING },
            order: { createdAt: 'ASC' },
            take: limit,
        });
    }

    async markPublished(id: string, queryRunner?: unknown): Promise<void> {
        await this.getRepository(queryRunner).update(id, {
            status: OutboxStatus.PUBLISHED,
            publishedAt: new Date(),
        });
    }

    async markFailed(id: string, queryRunner?: unknown): Promise<void> {
        await this.getRepository(queryRunner).update(id, {
            status: OutboxStatus.FAILED,
            retryCount: () => 'retry_count + 1',
        });
    }
}
