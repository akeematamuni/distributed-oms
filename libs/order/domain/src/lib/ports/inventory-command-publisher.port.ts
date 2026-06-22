import { ReserveInventoryCommandPayload } from '@doms/shared/events';

export interface IInventoryCommandPublisher {
    publish(payload: ReserveInventoryCommandPayload): Promise<void>;
}

export const INVENTORY_COMMAND_PUBLISHER = Symbol('INVENTORY_COMMAND_PUBLISHER');
