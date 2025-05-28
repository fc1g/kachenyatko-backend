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
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable, tap } from 'rxjs';
import { ROLE_KEY, ROLE_NAME } from '../constants';
import { AuthenticationRequest } from '../interfaces';
import { AUTH_SERVICE_NAME, AuthServiceClient, UserMessage } from '../types';

type Request = AuthenticationRequest & { user: UserMessage };

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
    let request: Request;

    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest<Request>();
    } else {
      request = GqlExecutionContext.create(context).getContext<{
        req: Request;
      }>().req;
    }

    const jwt =
      request.cookies?.Authentication ||
      (request.headers?.authentication as string);

    if (!jwt) {
      throw new UnauthorizedException('No token provided');
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
            throw new UnauthorizedException('Access denied');
          }
          request.user = res;
        }),
        map(() => true),
        catchError((err) => {
          this.logger.error(err);
          throw new UnauthorizedException('Invalid token');
        }),
      );
  }
}
