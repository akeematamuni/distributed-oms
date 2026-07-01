import { Order } from './order.aggregate';
import { OrderLine } from '../entities/order-line.entity';
import { Money } from '../value-objects/money.vo';
import { Address } from '../value-objects/address.vo';
import { OrderStatusEnum } from '../value-objects/order-status.vo';
import { InvalidOrderTransitionException } from '../exceptions/invalid-order-transition.exception';
import { OrderCreatedDomainEvent } from '../events/order-created.domain-event';
import { OrderConfirmedDomainEvent } from '../events/order-confirmed.domain-event';
import { OrderCancelledDomainEvent } from '../events/order-cancelled.domain-event';
import { InventoryAllocatedDomainEvent } from '../events/inventory-allocated.domain-event';

const validAddress = Address.create({
    street: '101 Ikemo St',
    city: 'Ojo',
    state: 'Lagos',
    postcode: '107102',
    country: 'NG',
});

const validLine = OrderLine.create({
    sku: 'ORDER-1234',
    quantity: 2,
    unitPrice: Money.create(500, 'USD'),
});

const validProps = {
    customerId: 'b39f9b73-c3ac-4132-8a10-1858fd4de07c',
    shippingAddress: validAddress,
    channel: 'web',
    lines: [validLine],
};

describe('Order', () => {
    describe('create', () => {
        it('should create a valid order in DRAFT status', () => {
            const order = Order.create(validProps);
            expect(order.status.value).toBe(OrderStatusEnum.DRAFT);
        });

        it('should calculate totalAmount correctly', () => {
            const order = Order.create(validProps);
            expect(order.totalAmount.amount).toBe(1000);
        });

        it('should apply OrderCreatedEvent', () => {
            const order = Order.create(validProps);
            const events = order.pullDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(OrderCreatedDomainEvent);
        });

        it('should throw if no lines provided', () => {
            expect(() => Order.create({ ...validProps, lines: [] })).toThrow();
        });

        it('should throw if lines have mixed currencies', () => {
            const euroLine = OrderLine.create({
                sku: 'GADGET-5678',
                quantity: 1,
                unitPrice: Money.create(500, 'EUR'),
            });

            expect(() => Order.create({ ...validProps, lines: [validLine, euroLine] })).toThrow();
        });
    });

    describe('confirm', () => {
        it('should transition from DRAFT to CONFIRMED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();
            order.confirm();

            expect(order.status.value).toBe(OrderStatusEnum.CONFIRMED);
        });

        it('should apply OrderConfirmedEvent', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.confirm();
            const events = order.pullDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(OrderConfirmedDomainEvent);
        });

        it('should throw if order is already CANCELLED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();
            order.cancel('test');

            expect(() => order.confirm()).toThrow(InvalidOrderTransitionException);
        });

        it('should throw if order is already CONFIRMED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();
            order.confirm();

            expect(() => order.confirm()).toThrow(InvalidOrderTransitionException);
        });
    });

    describe('cancel', () => {
        it('should transition from DRAFT to CANCELLED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();
            order.cancel('INVENTORY_UNAVAILABLE');

            expect(order.status.value).toBe(OrderStatusEnum.CANCELLED);
        });

        it('should transition from CONFIRMED to CANCELLED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.confirm();
            order.pullDomainEvents();

            order.cancel('CUSTOMER_REQUESTED');

            expect(order.status.value).toBe(OrderStatusEnum.CANCELLED);
        });

        it('should apply OrderCancelledEvent with reason', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.cancel('INVENTORY_UNAVAILABLE');
            const events = order.pullDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(OrderCancelledDomainEvent);
        });

        it('should throw if order is already CANCELLED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.cancel('test');

            expect(() => order.cancel('test again')).toThrow(InvalidOrderTransitionException);
        });

        it('should throw if order is ALLOCATED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.confirm();
            order.pullDomainEvents();

            order.allocate('d329ad89-286f-4485-90f1-552591d7b087');

            expect(() => order.cancel('test')).toThrow(InvalidOrderTransitionException);
        });
    });

    describe('allocate', () => {
        it('should transition from CONFIRMED to ALLOCATED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.confirm();
            order.pullDomainEvents();

            order.allocate('02dc878a-e746-4fb7-9959-c846ecc72564');

            expect(order.status.value).toBe(OrderStatusEnum.ALLOCATED);
        });

        it('should apply InventoryAllocatedEvent', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            order.confirm();
            order.pullDomainEvents();

            order.allocate('02dc878a-e746-4fb7-9959-c846ecc72564');
            const events = order.pullDomainEvents();

            expect(events).toHaveLength(1);
            expect(events[0]).toBeInstanceOf(InventoryAllocatedDomainEvent);
        });

        it('should throw if order is not CONFIRMED', () => {
            const order = Order.create(validProps);
            order.pullDomainEvents();

            expect(() => order.allocate('02dc878a-e746-4fb7-9959-c846ecc72564')).toThrow(
                InvalidOrderTransitionException,
            );
        });
    });
});
