import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../infrastructure/services/BcryptPasswordHasher';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
} from '../../application/use-cases/auth.use-cases';
import { sendCreated, sendSuccess } from '../../shared/utils/response';

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

const registerUser = new RegisterUserUseCase(userRepository, passwordHasher);
const loginUser = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
const refreshToken = new RefreshTokenUseCase(userRepository, tokenService);

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
