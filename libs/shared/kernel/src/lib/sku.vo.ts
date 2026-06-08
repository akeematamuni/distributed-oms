import { ValueObjectBase } from './value-object.base';

export class SKU extends ValueObjectBase<{ value: string }> {
    private static readonly FORMAT = /^[A-Z]{2,6}-\d{4,8}$/;

    private constructor(props: { value: string }) {
        super(props);
    }

    private static validate(value: string): void {
        if (!this.FORMAT.test(value)) {
            throw new Error(`Invalid SKU format: ${value}. Expected Format: TOOL-001234`);
        }
    }

    static create(value: string): SKU {
        const normalized = value.toUpperCase().trim();
        this.validate(normalized);
        return new SKU({ value: normalized });
    }

    get value(): string {
        return this.props.value;
    }
}
