import { AuthProvider } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { GoogleProfile } from '../interfaces/google-profile.interface';
import { GoogleTokenPayload } from '../interfaces/google-token-payload.interface';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('OAUTH_GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>(
        'OAUTH_GOOGLE_CLIENT_SECRET',
      ),
      callbackURL: configService.getOrThrow<string>(
        'OAUTH_GOOGLE_CALLBACK_URL',
      ),
      scope: ['profile', 'email'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const { id, name, emails } = profile;

    const user: GoogleTokenPayload = {
      provider: AuthProvider.GOOGLE,
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };

    done(null, user);
  }
}
