import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  UpdateProfileUseCase,
  GetCurrentUserUseCase,
} from '../../application/use-cases/auth.use-cases';
import { sendCreated, sendSuccess } from '../../shared/utils/response';
import { UnauthorizedError } from '../../shared/errors/AppError';

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

const registerUser = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUser = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
const refreshToken = new RefreshTokenUseCase(userRepository, tokenService);
const updateProfile = new UpdateProfileUseCase(userRepository, passwordHasher, tokenService);
const getCurrentUser = new GetCurrentUserUseCase(userRepository);

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser.execute(req.body);
    sendCreated(res, 'Usuario registrado exitosamente', user);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser.execute(req.body);
    sendSuccess(res, 'Inicio de sesión exitoso', result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await refreshToken.execute(req.body.refreshToken);
    sendSuccess(res, 'Token renovado exitosamente', result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const user = await getCurrentUser.execute(req.user.userId);
    sendSuccess(res, 'Usuario autenticado', user);
  } catch (error) {
    next(error);
  }
}

export async function patchProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const result = await updateProfile.execute(req.user.userId, req.body);
    sendSuccess(res, 'Perfil actualizado exitosamente', result);
  } catch (error) {
    next(error);
  }
}
