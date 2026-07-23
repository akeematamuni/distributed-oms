import {
    Injectable,
    Inject,
    CallHandler,
    ExecutionContext,
    NestInterceptor,
    Logger,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, of, tap } from 'rxjs';
import { IDEMPOTENCY_STORE, IIdempotencyStorePort } from '../port/idempotency.store.port';

const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

/**
 * Leverage customerId and idempotency key as unique key for caching responses
 * Upgrade to a more robust authenticated approach later (e.g JWT validated IDs)
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(IDEMPOTENCY_STORE) private readonly store: IIdempotencyStorePort,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const UUID_V4_REGEX =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        const request = context.switchToHttp().getRequest();

        const key = request.headers[IDEMPOTENCY_KEY_HEADER];
        if (!key)
            throw new HttpException('Idempotency-Key header is required', HttpStatus.BAD_REQUEST);

        if (!UUID_V4_REGEX.test(key))
            throw new HttpException(
                'Idempotency key must be a valid UUID v4 string',
                HttpStatus.BAD_REQUEST,
            );

        const customerId = request.body?.customerId;
        if (!customerId)
            throw new HttpException('Customer ID is required in payload', HttpStatus.BAD_REQUEST);

        // Create a unique key
        const scopedKey = `${key}:${customerId}`;

        const cached = await this.store.get(scopedKey);
        if (cached) {
            this.logger.log(`Idempotency hit for key: ${scopedKey}`);
            return of(cached);
        }

        const ttlSeconds = this.config.get('TTL_SECONDS', 86400);
        return next.handle().pipe(
            tap(async (response) => {
                await this.store.set(scopedKey, response, ttlSeconds);
            }),
        );
    }
}
