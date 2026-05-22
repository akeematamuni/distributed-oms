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
import { IDEMPOTENCY_STORE, IdempotencyStorePort } from './idempotency.store.port';

const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(IDEMPOTENCY_STORE) private readonly store: IdempotencyStorePort,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest();

        const key = request.headers[IDEMPOTENCY_KEY_HEADER];
        if (!key)
            throw new HttpException('Idempotency-key header is required', HttpStatus.BAD_REQUEST);

        const cached = this.store.get(key);
        if (cached) {
            this.logger.log(`Idempotency hit for key: ${key}`);
            return of(cached);
        }

        const ttlSeconds = this.config.get('TTL_SECONDS');
        return next.handle().pipe(
            tap(async (response) => {
                await this.store.set(key, response, ttlSeconds);
            }),
        );
    }
}
