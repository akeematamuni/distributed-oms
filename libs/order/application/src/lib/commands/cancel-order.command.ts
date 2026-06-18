import { CommandBase } from '@doms/shared/kernel';

export class CancelOrderCommand extends CommandBase {
    constructor(
        public readonly orderId: string,
        public readonly reason: string,
        correlationId: string,
    ) {
        super(correlationId);
    }
}
