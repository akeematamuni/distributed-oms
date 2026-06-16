import { IsString, IsNotEmpty, Length, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';
import { OrderLineDto } from './order-line.dto';
import { CreateOrderInput } from '../types/create-order.type';

export class CreateOrderDto implements CreateOrderInput {
    @ApiProperty({ type: String, description: 'Customer UUID' })
    @IsUUID()
    customerId!: string;

    @ApiProperty({ type: String, example: 'web' })
    @IsString()
    @IsNotEmpty()
    @Length(3, 15)
    channel!: string;

    @ApiProperty({ type: () => AddressDto })
    @Type(() => AddressDto)
    @ValidateNested({ each: true })
    shippingAddress!: AddressDto;

    @ApiProperty({ type: () => [OrderLineDto] })
    @IsArray()
    @Type(() => OrderLineDto)
    @ValidateNested({ each: true })
    lines!: OrderLineDto[];
}
