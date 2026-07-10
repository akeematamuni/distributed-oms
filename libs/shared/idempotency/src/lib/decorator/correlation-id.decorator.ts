import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const CorrelationId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const request = ctx.switchToHttp().getRequest();
    const correlationId = request.correlationId;

    if (correlationId && !UUID_V4_REGEX.test(correlationId)) {
        throw new BadRequestException('Validation failed (uuid v4 is expected)');
    }

    return correlationId;
});
