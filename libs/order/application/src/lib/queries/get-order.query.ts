import { QueryBase } from '@doms/shared/kernel';

export class GetOrderQuery extends QueryBase {
    constructor(
        public readonly orderId: string,
        correlationId: string,
    ) {
        super(correlationId);
    }
}
