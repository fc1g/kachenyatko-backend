import { AUTH_PROVIDER, User } from '@app/common';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { GoogleTokenPayload } from './interfaces/google-token-payload.interface';
import { TokenPayload } from './interfaces/token-payload.interface';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  signToken(user: User, res: Response) {
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() +
        this.configService.getOrThrow<number>('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    res.cookie('Authentication', token, {
      httpOnly: true,
      sameSite: 'lax',
      expires,
      path: '/',
    });

    return { token };
  }

  async signup(createUserDto: CreateUserDto, res: Response) {
    const user = await this.usersService.create(createUserDto);

    const { token } = this.signToken(user, res);

    return { user, token };
  }

  async loginWithGoogle(payload: GoogleTokenPayload, res: Response) {
    try {
      const user = await this.usersService.getUser({ email: payload.email });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      this.signToken(user, res);
    } catch (err) {
      this.logger.error(err);

      const user = await this.usersService.create({
        email: payload.email,
        password: null,
        provider: AUTH_PROVIDER.GOOGLE,
      });

      this.signToken(user, res);
    }

    return res.redirect(
      this.configService.getOrThrow<string>('OAUTH_GOOGLE_REDIRECT_URL'),
    );
  }
}
