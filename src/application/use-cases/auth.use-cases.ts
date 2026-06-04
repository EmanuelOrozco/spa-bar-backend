import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher, TokenService } from '../../infrastructure/services/PasswordHasher';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../dto/auth.dto';
import { toPublicUser } from '../../domain/entities/User';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/AppError';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return toPublicUser(user);
  }
}

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

export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no válido');
    }

    const valid = await this.passwordHasher.compare(input.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('La contraseña actual no es correcta');
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);

    const updated = await this.userRepository.update(userId, {
      passwordHash,
    });

    const tokenPayload = {
      userId: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    };

    return {
      user: toPublicUser(updated),
      accessToken: this.tokenService.signAccess(tokenPayload),
      refreshToken: this.tokenService.signRefresh({ userId: updated.id }),
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
