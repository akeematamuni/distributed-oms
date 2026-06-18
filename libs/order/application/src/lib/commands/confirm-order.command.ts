import { CommandBase } from '@doms/shared/kernel';

export class ConfirmOrderCommand extends CommandBase {
    constructor(
        public readonly orderId: string,
        correlationId: string,
    ) {
        super(correlationId);
    }
}
