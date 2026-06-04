import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../database/env';
import { TokenService } from './PasswordHasher';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { JwtPayload } from '../../shared/types';

export class JwtTokenService implements TokenService {
  signAccess(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  signRefresh(payload: { userId: string }): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  verifyAccess(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }

  verifyRefresh(token: string): { userId: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      throw new UnauthorizedError('Refresh token inválido o expirado');
    }
  }
}
