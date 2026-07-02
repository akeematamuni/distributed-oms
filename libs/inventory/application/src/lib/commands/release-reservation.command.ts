import { CommandBase } from '@doms/shared/kernel';

export class ReleaseReservationCommand extends CommandBase {
    constructor(
        readonly sku: string,
        readonly nodeId: string,
        correlationId: string,
    ) {
        super(correlationId);
    }
}
