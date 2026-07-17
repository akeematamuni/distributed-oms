import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
    INVENTORY_REPOSITORY,
    IInventoryRepositoryPort,
    AtpCalculatorService,
} from '@doms/inventory/domain';
import { AvailabilityResponseDto, NodeAvailabilityDto } from '../dtos/availability-response.dto';
import { GetAvailabilityQuery } from './get-availability.query';

/**
 * The data response tells the caller what node can be reserved on
 * The logic here can also be separated into an application service to avoid handler chaining
 */
@QueryHandler(GetAvailabilityQuery)
export class GetAvailabilityHandler implements IQueryHandler<GetAvailabilityQuery> {
    constructor(
        @Inject(INVENTORY_REPOSITORY)
        private readonly inventoryRepositiry: IInventoryRepositoryPort,
    ) {}

    async execute(query: GetAvailabilityQuery): Promise<AvailabilityResponseDto[] | null> {
        const { skus } = query;
        const inventoryNodeMap = await this.inventoryRepositiry.findBySkus(skus);

        // Orders can't be fulfilled when length aren't equal
        if (inventoryNodeMap.size !== skus.length) return null;

        const response: AvailabilityResponseDto[] = [];

        for (const sku of inventoryNodeMap.keys()) {
            const inventoryNodes = inventoryNodeMap.get(sku);

            if (inventoryNodes) {
                let totalAvailable = 0;
                const nodes: NodeAvailabilityDto[] = [];

                for (const node of inventoryNodes) {
                    const available = AtpCalculatorService.calculate(node).value;
                    nodes.push({ available, nodeId: node.nodeId });
                    totalAvailable += available;
                }

                response.push({ sku, totalAvailable, nodes });
            }
        }

        return response;
    }
}
