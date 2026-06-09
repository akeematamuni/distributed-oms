export class OrderNotFoundException extends Error {
    constructor(orderId: string) {
        super(`Order not found: ${orderId}`);
        this.name = 'OrderNotFoundException';
    }
}
