export class OrderAlreadyExistsException extends Error {
    constructor(orderId: string) {
        super(`Order already exists: ${orderId}`);
        this.name = 'OrderAlreadyExistsException';
    }
}
