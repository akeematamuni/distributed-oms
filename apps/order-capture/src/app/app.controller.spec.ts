import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { IDEMPOTENCY_STORE } from '@doms/shared/idempotency';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let controller: AppController;
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let appService: AppService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                { provide: CommandBus, useValue: { execute: jest.fn() } },
                { provide: QueryBus, useValue: { execute: jest.fn() } },
                {
                    provide: AppService,
                    useValue: { getData: jest.fn().mockReturnValue({ message: 'Hello' }) },
                },
                { provide: ConfigService, useValue: { get: jest.fn() } },
                { provide: IDEMPOTENCY_STORE, useValue: {} },
            ],
        }).compile();

        controller = module.get<AppController>(AppController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
        appService = module.get<AppService>(AppService);
    });

    describe('getData', () => {
        it('should call appService.getData', async () => {
            const result = controller.getData();

            expect(appService.getData).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Hello' });
        });
    });

    describe('create', () => {
        it('should dispatch CreateOrderCommand with correct data', async () => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const dto = {
                customerId: 'uuid-1',
                channel: 'web',
                shippingAddress: { city: 'Makoko' },
                lines: [],
            } as any;

            const expectedResult = { id: 'order-1' };

            jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedResult);

            const result = await controller.create(dto);

            expect(commandBus.execute).toHaveBeenCalledWith(
                expect.objectContaining({
                    customerId: dto.customerId,
                    channel: dto.channel,
                    shippingAddress: dto.shippingAddress,
                    lines: dto.lines,
                }),
            );
            expect(result).toBe(expectedResult);
        });
    });

    describe('find', () => {
        it('should dispatch GetOrderQuery with correct ID', async () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            const expectedResult = { id };

            jest.spyOn(queryBus, 'execute').mockResolvedValue(expectedResult);

            const result = await controller.find(id);

            expect(queryBus.execute).toHaveBeenCalledWith(expect.objectContaining({ orderId: id }));
            expect(result).toBe(expectedResult);
        });
    });
});
