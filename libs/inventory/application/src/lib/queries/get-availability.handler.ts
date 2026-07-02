import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
    INVENTORY_REPOSITORY,
    IInventoryRepositoryPort,
    AtpCalculatorService,
} from '@doms/inventory/domain';
import { AvailabilityResponseDto } from '../dtos/availability-response.dto';
import { GetAvailabilityQuery } from './get-availability.query';

/**
 * Consumer in apps/inventory calls this handler first
 * Then the data response tells the logic what node to reserve on
 */
@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler implements IQueryHandler<GetAvailabilityQuery> {
    constructor(
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepositiry: IInventoryRepositoryPort,
    ) {}

    async execute(query: GetAvailabilityQuery): Promise<AvailabilityResponseDto> {
        const inventoryNodes = await this.inventoryRepositiry.findBySku(query.sku);

        let totalAvailable = 0;
        let nodes: Array<{ nodeId: string; available: number }> = [];

        for (const inventoryNode of inventoryNodes) {
            const available = AtpCalculatorService.calculate(inventoryNode).value;
            nodes.push({ available, nodeId: inventoryNode.nodeId });
            totalAvailable += available;
        }

        return {
            sku: inventoryNodes[0].sku,
            totalAvailable,
            nodes,
        };
    }
}
