import { CommandBase } from '@doms/shared/kernel';
import { ReserveInventoryLinesDto } from '../dtos/reserve-inventory.dto';

export class ReserveInventoryCommand extends CommandBase {
    constructor(
        readonly orderId: string,
        readonly lines: ReserveInventoryLinesDto[],
        correlationId: string,
    ) {
        super(correlationId);
    }
}
