import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../entities';
import { AuthenticationRequest } from '../interfaces';

type Request = AuthenticationRequest & { user: User };

const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest<{ user: User }>().user;
  }

  const user = (context.getArgs()[2] as { req: Request })?.req?.user;

  if (user) {
    return user;
  }

  throw new UnauthorizedException();
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
