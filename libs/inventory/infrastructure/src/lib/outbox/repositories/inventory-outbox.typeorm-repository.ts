import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { IOutboxRepositoryPort, OutboxRecord, OutboxStatus } from '@doms/shared/outbox';
import { InventoryOutboxTypeOrmEntity } from '../entities/inventory-outbox.typeorm-entity';

@Injectable()
export class InventoryOutboxTypeOrmRepository implements IOutboxRepositoryPort {
    constructor(
        @InjectRepository(InventoryOutboxTypeOrmEntity)
        private readonly orderOutboxRepository: Repository<InventoryOutboxTypeOrmEntity>,
    ) {}

    private getRepository(queryRunner?: unknown): Repository<InventoryOutboxTypeOrmEntity> {
        if (queryRunner && typeof queryRunner === 'object' && 'manager' in queryRunner) {
            const qr = queryRunner as QueryRunner;
            return qr.manager.getRepository(InventoryOutboxTypeOrmEntity);
        }

        return this.orderOutboxRepository;
    }

    async save(
        record: Omit<OutboxRecord, 'createdAt' | 'publishedAt' | 'retryCount'>,
        queryRunner: unknown,
    ): Promise<void> {
        await this.getRepository(queryRunner).save(record);
    }

    // SKIP LOCKED must be used to avoid collision
    async findPending(limit: number, queryRunner: unknown): Promise<OutboxRecord[]> {
        // return await this.getRepository(queryRunner).find({
        //     where: { status: OutboxStatus.PENDING },
        //     order: { createdAt: 'ASC' },
        //     take: limit,
        // });

        const qr = queryRunner as QueryRunner;

        return qr.manager.query(
            `SELECT * FROM inventory_outboxes
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT $1
            FOR UPDATE SKIP LOCKED`,
            [limit],
        );
    }

    async markPublished(id: string, queryRunner: unknown): Promise<void> {
        await this.getRepository(queryRunner).update(id, {
            status: OutboxStatus.PUBLISHED,
            publishedAt: new Date(),
        });
    }

    async markFailed(id: string, queryRunner: unknown): Promise<void> {
        await this.getRepository(queryRunner).update(id, {
            status: OutboxStatus.FAILED,
            retryCount: () => 'retry_count + 1',
        });
    }
}
