import { AUTH_PROVIDER } from '@app/common';

export interface GoogleTokenPayload {
  provider: AUTH_PROVIDER;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
}
