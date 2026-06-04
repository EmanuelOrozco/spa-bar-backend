import { Request, Response, NextFunction } from 'express';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AppError';

const tokenService = new JwtTokenService();

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return next(new UnauthorizedError('Token de autenticación requerido'));
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Formato de token inválido'));
  }

  try {
    const payload = tokenService.verifyAccess(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Acceso restringido a administradores'));
  }
  next();
}
