import { Request } from 'express';

export interface AuthenticationCookieRequest {
  cookies: Request['cookies'] & {
    Authentication?: string;
  };
}

export interface AuthenticationHeaderRequest {
  headers: Request['headers'] & {
    Authentication?: string;
  };
}

export interface AuthenticationRpcCallRequest {
  Authentication?: string;
}

export interface AuthenticationRequest
  extends AuthenticationCookieRequest,
    AuthenticationHeaderRequest,
    AuthenticationRpcCallRequest {}
