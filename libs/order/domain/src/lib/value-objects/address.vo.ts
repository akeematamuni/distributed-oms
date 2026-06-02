import { ValueObjectBase } from '@doms/shared/kernel';

export interface AddressProps {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string; // 2 letter notation (e.g. "GB", "US")
}

export class Address extends ValueObjectBase<AddressProps> {
    constructor(props: AddressProps) {
        super(props);
    }

    static create(props: AddressProps): Address {
        const fields: (keyof AddressProps)[] = ['city', 'country', 'postcode', 'state', 'street'];

        for (const field of fields) {
            if (!props[field] || props[field].trim().length === 0) {
                throw new Error(`Address.${field} is required and cannot be empty!`);
            }
        }

        if (props.country.length !== 2) {
            throw new Error(`Address.country must be 2 letter string. Got: ${props.country}`);
        }

        return new Address({
            street: props.street.trim(),
            city: props.city.trim(),
            state: props.state.trim(),
            postcode: props.postcode.trim(),
            country: props.country.trim().toUpperCase(),
        });
    }

    get street(): string {
        return this.props.street;
    }
    get city(): string {
        return this.props.city;
    }
    get state(): string {
        return this.props.state;
    }
    get postcode(): string {
        return this.props.postcode;
    }
    get country(): string {
        return this.props.country;
    }
}
