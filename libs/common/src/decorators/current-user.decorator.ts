import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'apps/auth/src/users/models/users.schema';

const getCurrentUserByContext = <T extends { user: UserDocument }>(
  ctx: ExecutionContext,
): UserDocument => {
  return ctx.switchToHttp().getRequest<T>().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDocument =>
    getCurrentUserByContext(ctx),
);
