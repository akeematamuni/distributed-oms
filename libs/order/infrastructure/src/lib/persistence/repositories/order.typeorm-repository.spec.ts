import { Repository } from 'typeorm';
import { OrderTypeOrmRepository } from './order.typeorm-repository';
import { OrderMapper } from '../mappers/order.mapper';
import { OrderTypeOrmEntity } from '../entities/order.typeorm-entity';
import { Order, OrderStatusEnum } from '@doms/order/domain';

const makeMockRepo = (): jest.Mocked<Repository<OrderTypeOrmEntity>> =>
    ({
        save: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn(),
        getRepository: jest.fn(),
    }) as unknown as jest.Mocked<Repository<OrderTypeOrmEntity>>;

const makeMockOrder = (): jest.Mocked<Order> =>
    ({
        id: '496d5183-f8ff-49eb-86f5-48e1f0bcf99c',
        customerId: '28d5c4e3-0c05-47e7-8686-3121b537642f',
        status: { value: OrderStatusEnum.DRAFT },
        channel: 'web',
        totalAmount: { amount: 2000, currency: 'GBP' },
        shippingAddress: {
            street: '14 Old Town Street',
            city: 'Ajah',
            state: 'Lagos',
            postcode: '100101',
            country: 'NG',
        },
        version: 1,
        lines: [],
    }) as unknown as jest.Mocked<Order>;

describe('OrderTypeOrmRepository', () => {
    let repository: OrderTypeOrmRepository;
    let mockRepo: jest.Mocked<Repository<OrderTypeOrmEntity>>;

    beforeEach(() => {
        mockRepo = makeMockRepo();
        repository = new OrderTypeOrmRepository(mockRepo);
        jest.spyOn(OrderMapper, 'toPersistence').mockReturnValue(new OrderTypeOrmEntity());
        jest.spyOn(OrderMapper, 'toDomain').mockReturnValue(makeMockOrder());
    });

    afterEach(() => jest.clearAllMocks());

    describe('save', () => {
        it('should call repo.save with the mapped entity', async () => {
            const order = makeMockOrder();
            await repository.save(order);
            expect(OrderMapper.toPersistence).toHaveBeenCalledWith(order);
            expect(mockRepo.save).toHaveBeenCalledTimes(1);
        });

        it('should use the queryRunner manager when provided', async () => {
            const order = makeMockOrder();
            const mockQrRepo = { save: jest.fn() } as unknown as Repository<OrderTypeOrmEntity>;
            const mockQr = {
                manager: { getRepository: jest.fn().mockReturnValue(mockQrRepo) },
            };

            await repository.save(order, mockQr);
            expect(mockQrRepo.save).toHaveBeenCalledTimes(1);
            expect(mockRepo.save).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a domain Order when entity is found', async () => {
            mockRepo.findOne.mockResolvedValue(new OrderTypeOrmEntity());
            const result = await repository.findById('496d5183-f8ff-49eb-86f5-48e1f0bcf99c');
            expect(result).not.toBeNull();
            expect(OrderMapper.toDomain).toHaveBeenCalledTimes(1);
        });

        it('should return null when entity is not found', async () => {
            mockRepo.findOne.mockResolvedValue(null);
            const result = await repository.findById('496d5183-f8ff-49eb-86f5-48e1f0bcf99c');
            expect(result).toBeNull();
        });

        it('should use the queryRunner manager when provided', async () => {
            const mockQrRepo = {
                findOne: jest.fn().mockResolvedValue(null),
            } as unknown as Repository<OrderTypeOrmEntity>;
            const mockQr = {
                manager: { getRepository: jest.fn().mockReturnValue(mockQrRepo) },
            };

            await repository.findById('496d5183-f8ff-49eb-86f5-48e1f0bcf99c', mockQr);
            expect(mockQrRepo.findOne).toHaveBeenCalledTimes(1);
            expect(mockRepo.findOne).not.toHaveBeenCalled();
        });
    });

    describe('exists', () => {
        it('should return true when order exists', async () => {
            mockRepo.count.mockResolvedValue(1);
            expect(await repository.exists('496d5183-f8ff-49eb-86f5-48e1f0bcf99c')).toBe(true);
        });

        it('should return false when order does not exist', async () => {
            mockRepo.count.mockResolvedValue(0);
            expect(await repository.exists('496d5183-f8ff-49eb-86f5-48e1f0bcf99c')).toBe(false);
        });
    });
});
