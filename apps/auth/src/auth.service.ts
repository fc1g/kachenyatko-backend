import { AUTH_PROVIDER, User } from '@app/common';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
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

  getAccessToken(tokenPayload: TokenPayload) {
    return this.jwtService.sign(tokenPayload);
  }

  getRefreshToken(tokenPayload: TokenPayload) {
    return this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION')}s`,
    });
  }

  async getTokens(tokenPayload: TokenPayload, res: Response) {
    const accessToken = this.getAccessToken(tokenPayload);
    const refreshToken = this.getRefreshToken(tokenPayload);

    await this.usersService.updateRefreshToken(
      tokenPayload.userId,
      refreshToken,
    );

    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      maxAge:
        this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRATION') *
        1000,
    });

    return { accessToken };
  }

  async signup(createUserDto: CreateUserDto, res: Response) {
    const user = await this.usersService.create(createUserDto);

    return this.getTokens({ userId: user.id }, res);
  }

  async logout(user: User, res: Response) {
    await this.usersService.updateRefreshToken(user.id, null);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
    };

    res.clearCookie('Refresh', { ...cookieOptions });

    return { statusCode: 200, message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string, res: Response) {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.getUserIfRefreshTokenMatches(refreshToken, payload);

    return this.getTokens({ userId: user.id }, res);
  }

  private async getUserIfRefreshTokenMatches(
    refreshToken: string,
    tokenPayload: TokenPayload,
  ) {
    const user = await this.usersService.getUser({ id: tokenPayload.userId });
    if (!user.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    return user;
  }

  async loginWithGoogle(payload: GoogleTokenPayload, res: Response) {
    let user: User;
    try {
      user = await this.usersService.getUser({ email: payload.email });
    } catch (err) {
      this.logger.error(err);

      user = await this.usersService.create({
        email: payload.email,
        password: null,
        provider: AUTH_PROVIDER.GOOGLE,
      });
    }

    if (!user.provider) {
      throw new BadRequestException('Please login with your password');
    }

    if (user.provider && user.provider !== AUTH_PROVIDER.GOOGLE) {
      throw new UnauthorizedException(
        'Credentials are not valid. Please login with your provider',
      );
    }

    await this.getTokens({ userId: user.id }, res);

    return res.redirect(
      this.configService.getOrThrow<string>('OAUTH_GOOGLE_REDIRECT_URL'),
    );
  }
}
