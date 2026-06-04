import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../infrastructure/services/PasswordHasher';
import { CreateUserInput, UpdateUserInput } from '../dto/user.dto';
import { UserFilters } from '../../domain/repositories/UserRepository';
import { toPublicUser } from '../../domain/entities/User';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors/AppError';
import { isPrimaryAdminEmail } from '../../shared/constants/primaryAdmin';

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(filters: UserFilters) {
    return this.userRepository.findAll(filters);
  }
}

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return toPublicUser(user);
  }
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: CreateUserInput) {
    if (isPrimaryAdminEmail(input.email)) {
      throw new ConflictError('Este correo está reservado para el administrador principal');
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('El email ya está registrado');

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? 'employee',
      position: input.position ?? null,
    });

    return toPublicUser(user);
  }
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(id: string, input: UpdateUserInput) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');

    if (isPrimaryAdminEmail(existing.email)) {
      throw new ForbiddenError(
        'La cuenta del administrador principal no puede modificarse desde Staff'
      );
    }

    const normalizedEmail = input.email?.trim().toLowerCase();
    const currentEmail = existing.email.toLowerCase();

    if (normalizedEmail && normalizedEmail !== currentEmail) {
      if (isPrimaryAdminEmail(normalizedEmail)) {
        throw new ConflictError('Este correo está reservado para el administrador principal');
      }
      const emailTaken = await this.userRepository.findByEmail(normalizedEmail);
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictError('El email ya está registrado');
      }
    }

    let passwordHash: string | undefined;
    if (input.password) {
      passwordHash = await this.passwordHasher.hash(input.password);
    }

    const user = await this.userRepository.update(id, {
      name: input.name,
      email: normalizedEmail && normalizedEmail !== currentEmail ? normalizedEmail : undefined,
      passwordHash,
      role: input.role,
      position: input.position,
      isActive: input.isActive,
    });

    return toPublicUser(user);
  }
}

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');
    if (isPrimaryAdminEmail(existing.email)) {
      throw new ForbiddenError('No se puede eliminar al administrador principal');
    }
    await this.userRepository.delete(id);
  }
}
