export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  signAccess(payload: { userId: string; name: string; email: string; role: string }): string;
  signRefresh(payload: { userId: string }): string;
  verifyAccess(token: string): { userId: string; name: string; email: string; role: string };
  verifyRefresh(token: string): { userId: string };
}
