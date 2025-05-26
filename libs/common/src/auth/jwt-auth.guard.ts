import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ROLE_KEY, ROLE_NAME, SERVICE } from '../constants';
import { User } from '../entities';
import { AuthenticationRequest } from '../interfaces';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject(SERVICE.AUTH) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticationRequest & { user: User }>();
    const jwt =
      request.cookies?.Authentication || request.headers?.Authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<ROLE_NAME[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    return this.authClient
      .send<User>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          if (roles) {
            for (const role of roles) {
              if (!res.roles.map((r) => r.name).includes(role)) {
                this.logger.error(
                  `The user does not have valid roles: ${role}`,
                );
                throw new UnauthorizedException();
              }
            }
          }
          request.user = res;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          return of(false);
        }),
      );
  }
}
