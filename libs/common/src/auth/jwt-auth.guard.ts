import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ROLE_KEY, ROLE_NAME } from '../constants';
import { AuthenticationRequest } from '../interfaces';
import { AUTH_SERVICE_NAME, AuthServiceClient, UserMessage } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private authService: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticationRequest & { user: UserMessage }>();
    const jwt =
      request.cookies?.Authentication || request.headers?.Authentication;

    if (!jwt) {
      return false;
    }

    const roles = this.reflector.get<ROLE_NAME[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    return this.authService
      .authenticate({
        Authentication: jwt,
      })
      .pipe(
        tap((res) => {
          if (
            roles &&
            !roles.some((role) => res.roles.map((r) => r.name).includes(role))
          ) {
            this.logger.error(
              `The user does not have valid roles: ${JSON.stringify(roles)}`,
            );
            throw new UnauthorizedException();
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
