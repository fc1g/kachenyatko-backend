import { AuthProvider, User } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { GoogleTokenPayload } from './interfaces/google-token-payload.interface';
import { TokenPayload } from './interfaces/token-payload.interface';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  login(user: User, res: Response) {
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

  async signUp(createUserDto: CreateUserDto, res: Response) {
    const user = await this.usersService.create(createUserDto);

    const { token } = this.login(user, res);

    return { user, token };
  }

  async validateOAuthLogin(payload: GoogleTokenPayload): Promise<User> {
    try {
      const user = await this.usersService.getUser({ email: payload.email });

      return user;
    } catch (err) {
      console.error(err);
      return this.usersService.create({
        email: payload.email,
        password: null,
        provider: AuthProvider.GOOGLE,
      });
    }
  }
}
