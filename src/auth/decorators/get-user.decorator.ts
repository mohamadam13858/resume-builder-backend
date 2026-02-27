import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../types/current-user.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUser;
  },
);