export class InvalidOrderTransitionException extends Error {
    constructor(fromStatus: string, toStatus: string, orderId: string) {
        super(`Invalid order transition from ${fromStatus} to ${toStatus}. OrderId: ${orderId}`);
        this.name = 'InvalidOrderTransitionException';
    }
}
