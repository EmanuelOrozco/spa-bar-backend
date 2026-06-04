import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher, TokenService } from '../../infrastructure/services/PasswordHasher';
import { RegisterInput, LoginInput } from '../dto/auth.dto';
import { toPublicUser } from '../../domain/entities/User';
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('El email ya está registrado');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'employee',
      position: input.position ?? null,
    });

    return toPublicUser(user);
  }
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const valid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.tokenService.signAccess(payload),
      refreshToken: this.tokenService.signRefresh({ userId: user.id }),
      user: toPublicUser(user),
    };
  }
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(refreshToken: string) {
    const payload = this.tokenService.verifyRefresh(refreshToken);
    const user = await this.userRepository.findById(payload.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no válido');
    }

    const tokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.tokenService.signAccess(tokenPayload),
      refreshToken: this.tokenService.signRefresh({ userId: user.id }),
    };
  }
}
