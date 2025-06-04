import {
  Authentication,
  AuthServiceController,
  AuthServiceControllerMethods,
  CurrentUser,
  User,
  UserMessage,
} from '@app/common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { Request, Response } from 'express';
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
    return this.authService.getTokens({ userId: user.id }, res);
  }

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
  logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(user, res);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['Refresh'] as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.authService.refresh(refreshToken, res);
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
