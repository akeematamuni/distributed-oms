import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { INVENTORY_LOCK, IInventoryLockPort } from '@doms/inventory/domain';
import { OUTBOX_REPOSITORY, IOutboxRepositoryPort, OutboxStatus } from '@doms/shared/outbox';
import { IDEMPOTENCY_STORE, IIdempotencyStorePort } from '@doms/shared/idempotency';
import {
    InventoryNode,
    INVENTORY_REPOSITORY,
    IInventoryRepositoryPort,
    InsufficientInventoryException,
    ReservationAlreadyExistsException,
    Quantity,
} from '@doms/inventory/domain';
import { ReserveInventoryCommand } from './reserve-inventory.command';
import { InventoryReservedEvent, InventoryReservationFailedEvent } from '@doms/shared/events';

/**
 * Handler to reserve inventory for an order
 * Rolls back reservation in the event of failure
 * Writes outbox for either instance of success or failure
 */
@CommandHandler(ReserveInventoryCommand)
export class ReserveInventoryHandler implements ICommandHandler<ReserveInventoryCommand> {
    private readonly logger = new Logger(ReserveInventoryHandler.name);

    constructor(
        @Inject(INVENTORY_LOCK)
        private readonly inventoryLock: IInventoryLockPort,
        @Inject(IDEMPOTENCY_STORE)
        private readonly idempotencyStore: IIdempotencyStorePort,
        @Inject(OUTBOX_REPOSITORY)
        private readonly outboxRepository: IOutboxRepositoryPort,
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepository: IInventoryRepositoryPort,
        @Inject(DataSource) private readonly dataSource: DataSource,
        @Inject(ConfigService) private readonly configService: ConfigService,
    ) {}

    private async writeFailureOutbox(
        command: ReserveInventoryCommand,
        reason?: string,
    ): Promise<void> {
        // Create failure event
        const failureEvent: InventoryReservationFailedEvent = {
            eventId: randomUUID(),
            eventType: 'inventory.reservation.failed',
            eventVersion: 1,
            occurredAt: new Date().toISOString(),
            payload: {
                orderId: command.orderId,
                correlationId: command.correlationId,
                reason,
            },
        };

        // Create a new queryRunner to mange this transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await this.outboxRepository.save(
                {
                    id: failureEvent.eventId,
                    eventType: failureEvent.eventType,
                    eventVersion: failureEvent.eventVersion,
                    status: OutboxStatus.PENDING,
                    payload: failureEvent.payload as unknown as Record<string, unknown>,
                },
                queryRunner,
            );
        } catch {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
        } finally {
            if (!queryRunner.isReleased) await queryRunner.release();
        }
    }

    async execute(command: ReserveInventoryCommand): Promise<void> {
        // Check cache and return if already reserved
        const idempotencyKey = `${command.correlationId}:reserve-inventory`;
        if (await this.idempotencyStore.has(idempotencyKey)) return;

        let inventoryNode: InventoryNode | null = null;
        const acquiredLocks: string[] = [];

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            // Acquire all locks to prevent race conditions
            for (const line of command.lines) {
                const lockKey = `inventory-lock:${line.sku}:${line.nodeId}`;
                const acquired = await this.inventoryLock.acquire(
                    lockKey,
                    this.configService.get('INVENTORY_LOCK_TTL_MS', 5000),
                );

                if (!acquired) {
                    throw new Error(
                        `Failed to acquire lock for SKU: ${line.sku} at node: ${line.nodeId}`,
                    );
                }

                acquiredLocks.push(lockKey);
            }

            // Load inventory aggregate and make reservation
            await queryRunner.startTransaction();

            for (const line of command.lines) {
                inventoryNode = await this.inventoryRepository.findBySkuAndNode(
                    line.sku,
                    line.nodeId,
                );

                if (!inventoryNode) {
                    throw new Error(
                        `Failed to find inventory with SKU: ${line.sku} on node: ${line.nodeId}`,
                    );
                }

                inventoryNode.reserve(
                    command.correlationId,
                    command.orderId,
                    Quantity.fromRaw(line.quantity),
                );

                inventoryNode.pullDomainEvents();
                await this.inventoryRepository.save(inventoryNode, queryRunner);
            }

            // Write to outbox
            const successfulEvent: InventoryReservedEvent = {
                eventId: randomUUID(),
                eventType: 'inventory.reservation.succeeded',
                eventVersion: 1,
                occurredAt: new Date().toISOString(),
                payload: {
                    orderId: command.orderId,
                    correlationId: command.correlationId,
                    lines: command.lines.map((l) => ({
                        sku: l.sku,
                        quantity: l.quantity,
                        nodeId: l.nodeId,
                    })),
                },
            };

            await this.outboxRepository.save(
                {
                    id: successfulEvent.eventId,
                    eventType: successfulEvent.eventType,
                    eventVersion: successfulEvent.eventVersion,
                    status: OutboxStatus.PENDING,
                    payload: successfulEvent.payload as unknown as Record<string, unknown>,
                },
                queryRunner,
            );

            await queryRunner.commitTransaction();

            // Set idempotency
            await this.idempotencyStore.set(
                idempotencyKey,
                { success: true },
                this.configService.get('TTL_SECONDS', 86400),
            );
        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();

            // Check error type and write to failure outbox with failure reason
            let reason: string | undefined;

            if (
                error instanceof InsufficientInventoryException ||
                error instanceof ReservationAlreadyExistsException
            ) {
                reason = error.reason;
            }

            this.writeFailureOutbox(command, reason);

            this.logger.error(
                `Error occurred while trying to reserve inventory. CorrelationId: ${command.correlationId}`,
                error instanceof Error ? error.stack : String(error),
            );
        } finally {
            if (!queryRunner.isReleased) await queryRunner.release();

            // Release all locks
            for (const lock of acquiredLocks) {
                await this.inventoryLock.release(lock);
            }
        }
    }
}
