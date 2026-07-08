import { HttpStatus, Type } from '@nestjs/common';

export interface ErrorMapping {
    exception: Type<unknown>;
    statusCode: HttpStatus;
}

// Leverage inversion of control pattern to prevent circular dependency

/** Add custom errors and the respective http status code you want */
export class GlobalErrorRegistry {
    public static readonly errorMappings: ErrorMapping[] = [];

    public static addErrorMappings(mappings: ErrorMapping[]) {
        this.errorMappings.push(...mappings);
    }
}
