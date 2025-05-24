import { AuthProvider } from '@app/common';

export interface GoogleTokenPayload {
  provider: AuthProvider;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
}
