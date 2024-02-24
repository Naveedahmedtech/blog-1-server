import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const forwarded = request.headers['x-forwarded-for'];
    const isForwarded = forwarded ? forwarded.split(/, /)[0] : request.ip;
    const userAgent = request.headers['user-agent'];
    return { isForwarded, userAgent };
  },
);
