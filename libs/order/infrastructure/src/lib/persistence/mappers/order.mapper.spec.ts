import { OrderMapper } from './order.mapper';
import { OrderTypeOrmEntity } from '../entities/order.typeorm-entity';
import { OrderLineTypeOrmEntity } from '../entities/order-line.typeorm-entity';
import { OrderStatusEnum } from '@doms/order/domain';

const makeLineEntity = (
    overrides: Partial<OrderLineTypeOrmEntity> = {},
): OrderLineTypeOrmEntity => {
    const line = new OrderLineTypeOrmEntity();
    line.id = 'aab253b5-177f-4920-9d72-8173cc326c0a';
    line.sku = 'WG-1234';
    line.quantity = 2;
    line.unitPrice = '1000';
    line.currency = 'GBP';
    line.lineTotal = '2000';
    return Object.assign(line, overrides);
};

const makeOrderEntity = (overrides: Partial<OrderTypeOrmEntity> = {}): OrderTypeOrmEntity => {
    const entity = new OrderTypeOrmEntity();
    entity.id = 'ca937d4d-49fd-4212-9c21-3010f8ec4e26';
    entity.customerId = '3912bc7e-6458-4c66-b5ca-74388623e5bf';
    entity.status = OrderStatusEnum.DRAFT;
    entity.channel = 'web';
    entity.totalAmount = '2000';
    entity.currency = 'GBP';
    entity.street = '14 Old Town Street';
    entity.city = 'Ajah';
    entity.state = 'Lagos';
    entity.postcode = '100101';
    entity.country = 'NG';
    entity.version = 1;
    entity.createdAt = new Date('2026-05-04');
    entity.updatedAt = new Date('2026-05-04');
    entity.lines = [makeLineEntity()];
    return Object.assign(entity, overrides);
};

describe('OrderMapper', () => {
    describe('toDomain', () => {
        it('should map a TypeORM entity to an Order aggregate', () => {
            const entity = makeOrderEntity();
            const order = OrderMapper.toDomain(entity);

            expect(order.id).toBe(entity.id);
            expect(order.customerId).toBe(entity.customerId);
            expect(order.status.value).toBe(OrderStatusEnum.DRAFT);
            expect(order.channel).toBe('web');
            expect(order.totalAmount.amount).toBe(2000);
            expect(order.totalAmount.currency).toBe('GBP');
            expect(order.shippingAddress.country).toBe('NG');
            expect(order.lines).toHaveLength(1);
            expect(order.lines[0].sku).toBe('WG-1234');
            expect(order.lines[0].quantity).toBe(2);
            expect(order.lines[0].unitPrice.amount).toBe(1000);
        });

        it('should correctly compute lineTotal from unit price and quantity', () => {
            const entity = makeOrderEntity();
            const order = OrderMapper.toDomain(entity);
            expect(order.lines[0].lineTotal().amount).toBe(2000);
        });

        it('should map multiple lines', () => {
            const entity = makeOrderEntity({
                lines: [
                    makeLineEntity({ id: '2d3a6239-3ac8-48a9-b54c-5a04114e08d2', sku: 'WG-1234' }),
                    makeLineEntity({ id: '9cfdc3ee-fd73-41a2-90d6-12bd8876c13f', sku: 'WG-5678' }),
                ],
            });
            const order = OrderMapper.toDomain(entity);
            expect(order.lines).toHaveLength(2);
            expect(order.lines[1].sku).toBe('WG-5678');
        });
    });

    describe('toPersistence', () => {
        it('should map an Order aggregate to a TypeORM entity', () => {
            const raw = makeOrderEntity();
            const order = OrderMapper.toDomain(raw);
            const entity = OrderMapper.toPersistence(order);

            expect(entity.id).toBe(raw.id);
            expect(entity.customerId).toBe(raw.customerId);
            expect(entity.status).toBe(OrderStatusEnum.DRAFT);
            expect(entity.totalAmount).toBe('2000');
            expect(entity.currency).toBe('GBP');
            expect(entity.street).toBe('14 Old Town Street');
            expect(entity.country).toBe('NG');
            expect(entity.version).toBe(1);
            expect(entity.lines).toHaveLength(1);
        });

        it('should persist line fields correctly', () => {
            const raw = makeOrderEntity();
            const order = OrderMapper.toDomain(raw);
            const entity = OrderMapper.toPersistence(order);
            const line = entity.lines[0];

            expect(line.sku).toBe('WG-1234');
            expect(line.quantity).toBe(2);
            expect(line.unitPrice).toBe('1000');
            expect(line.lineTotal).toBe('2000');
            expect(line.currency).toBe('GBP');
        });

        it('should round-trip without data loss', () => {
            const raw = makeOrderEntity();
            const order = OrderMapper.toDomain(raw);
            const entity = OrderMapper.toPersistence(order);
            const orderAgain = OrderMapper.toDomain(entity);

            expect(orderAgain.id).toBe(order.id);
            expect(orderAgain.status.value).toBe(order.status.value);
            expect(orderAgain.totalAmount.amount).toBe(order.totalAmount.amount);
            expect(orderAgain.lines[0].sku).toBe(order.lines[0].sku);
        });
    });
});
