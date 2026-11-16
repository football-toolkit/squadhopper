import type { AuthErrorCode } from "@/lib/messages/auth";

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
};

export type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export interface CookieJar {
  getAll(): { name: string; value: string }[];
  setAll(cookies: CookieToSet[], headers?: Record<string, string>): void;
}

export type SignInResult = { ok: true } | { ok: false; code: AuthErrorCode };

export interface AuthService {
  hasSession(): Promise<boolean>;
  signIn(email: string, password: string): Promise<SignInResult>;
  signOut(): Promise<void>;
}
