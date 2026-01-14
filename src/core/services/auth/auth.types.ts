/**
 * Authentication Service Types
 * Type definitions for auth operations
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthError {
  code: string;
  message: string;
}
