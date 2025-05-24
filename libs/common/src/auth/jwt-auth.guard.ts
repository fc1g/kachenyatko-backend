import {
  AUTH_SERVICE,
  AuthenticationCookieRequest,
  AuthenticationHeaderRequest,
  RoleName,
  User,
} from '@app/common';
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

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt =
      context.switchToHttp().getRequest<AuthenticationCookieRequest>().cookies
        ?.Authentication ||
      context.switchToHttp().getRequest<AuthenticationHeaderRequest>().headers
        ?.Authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<RoleName[]>('roles', context.getHandler());

    return this.authClient
      .send<User>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          for (const role of roles) {
            if (!res.roles?.map((role) => role.name).includes(role)) {
              this.logger.error(
                `The user does not have required role: ${role}`,
              );
              throw new UnauthorizedException();
            }
          }
          context.switchToHttp().getRequest<{ user: User }>().user = res;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          return of(false);
        }),
      );
  }
}
