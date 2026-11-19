// What a failed sign-in reports. The server returns only these codes, never
// the login service's own text; the screen turns each into its message.
export type AuthErrorCode = "invalid_credentials" | "unavailable";

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
