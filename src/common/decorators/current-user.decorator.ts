import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../users/users.entity.js';

export const CurrentUser = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserEntity }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);