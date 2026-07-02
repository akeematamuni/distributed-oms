import { QueryBase } from '@doms/shared/kernel';

export class GetAvailabilityQuery extends QueryBase {
    constructor(
        readonly sku: string,
        correlationId: string,
    ) {
        super(correlationId);
    }
}
