import { ValueObjectBase } from '@doms/shared/kernel';

export interface MoneyProps {
    amount: number;
    currency: string;
}

export class Money extends ValueObjectBase<MoneyProps> {
    static create(amount: number, currency: string): Money {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new Error(`Amount must be a non-negative integer. You provided: ${amount}`);
        }

        if (!currency || currency.length !== 3) {
            throw new Error(`Currency must be a 3-character ISO code. You provided: ${currency}`);
        }

        return new Money({ amount, currency: currency.toUpperCase() });
    }

    add(other: Money): Money {
        if (this.props.currency !== other.props.currency) {
            throw new Error(
                `Cannot add money of different currencies like ${this.props.currency} and ${other.props.currency}`,
            );
        }

        const amount = this.props.amount + other.props.amount;
        return new Money({ amount, currency: this.props.currency });
    }

    multiply(factor: number): Money {
        if (!Number.isInteger(factor) || factor < 0) {
            throw new Error(
                `Multiplication factor must be a non-negative integer. You provided: ${factor}`,
            );
        }

        return new Money({ amount: this.props.amount * factor, currency: this.props.currency });
    }

    get amount(): number {
        return this.props.amount;
    }
    get currency(): string {
        return this.props.currency;
    }
}
