import {
  Authentication,
  AuthServiceController,
  AuthServiceControllerMethods,
  CurrentUser,
  Serialize,
  SignedUpDto,
  User,
  UserMessage,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleTokenPayload } from './interfaces/google-token-payload.interface';
import { CreateUserDto } from './users/dto/create-user.dto';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    return this.authService.signToken(user, res);
  }

  @Serialize(SignedUpDto)
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signup(createUserDto, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('Authentication', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    return { statusCode: 200, message: 'Logged out successfully' };
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @CurrentUser() payload: GoogleTokenPayload,
    @Res() res: Response,
  ) {
    return this.authService.loginWithGoogle(payload, res);
  }

  @UseGuards(JwtAuthGuard)
  authenticate(
    @Payload() request: Authentication & { user: UserMessage },
  ): UserMessage {
    return request.user;
  }
}
