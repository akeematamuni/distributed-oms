import { ValueObjectBase } from '@doms/shared/kernel';

export interface QuantityProps {
    value: number;
}

export class Quantity extends ValueObjectBase<QuantityProps> {
    private constructor(props: QuantityProps) {
        super(props);
    }

    static create(value: number): Quantity {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`Quantity value must be positive integer. Got: ${value}`);
        }

        return new Quantity({ value });
    }

    // static fromRaw(value: number): Quantity {
    //     if (!Number.isInteger(value) || value < 0) {
    //         throw new Error('Quantity from raw must be non-negative integer');
    //     }

    //     return new Quantity({ value });
    // }

    add(other: Quantity): Quantity {
        return new Quantity({ value: this.props.value + other.props.value });
    }

    subtract(other: Quantity): Quantity {
        const result = this.props.value - other.props.value;
        if (result < 0) {
            throw new Error(`Quantity subtraction would result in negative value: ${result}`);
        }

        return new Quantity({ value: result });
    }

    // isGreaterThan(other: Quantity): boolean {
    //     return this.props.value > other.props.value;
    // }

    // isGreaterThanOrEqual(other: Quantity): boolean {
    //     return this.props.value >= other.props.value;
    // }

    get value(): number {
        return this.props.value;
    }
}
