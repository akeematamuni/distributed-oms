import {
    Controller,
    Get,
    Post,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Body,
    ValidationPipe,
    ParseUUIDPipe,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
    OrderResponseDto,
    CreateOrderDto,
    CreateOrderCommand,
    GetOrderQuery,
} from '@doms/order/application';

import { IdempotencyInterceptor } from '@doms/shared/idempotency';

import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(
        @Inject(QueryBus) private readonly queryBus: QueryBus,
        @Inject(CommandBus) private readonly commandBus: CommandBus,
        @Inject(AppService) private readonly appService: AppService,
    ) {}

    @Get()
    getData() {
        return this.appService.getData();
    }

    @Post('/orders')
    @UseInterceptors(IdempotencyInterceptor)
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({ type: () => CreateOrderDto })
    @ApiResponse({ status: 201, type: () => OrderResponseDto })
    @ApiHeader({
        name: 'Idempotency-Key',
        description: 'UUID key to safely retry order creation',
        required: true,
    })
    async create(@Body(ValidationPipe) dto: CreateOrderDto): Promise<OrderResponseDto> {
        return await this.commandBus.execute(
            new CreateOrderCommand(dto.customerId, dto.channel, dto.shippingAddress, dto.lines),
        );
    }

    @Get('/orders/:id')
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, type: () => OrderResponseDto })
    async find(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
        return await this.queryBus.execute(new GetOrderQuery(id));
    }
}
