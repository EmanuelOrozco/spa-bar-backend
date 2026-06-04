import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher } from '../../infrastructure/services/PasswordHasher';
import { CreateUserInput, UpdateUserInput } from '../dto/user.dto';
import { UserFilters } from '../../domain/repositories/UserRepository';
import { toPublicUser } from '../../domain/entities/User';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';

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

    if (input.email && input.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(input.email);
      if (emailTaken) throw new ConflictError('El email ya está registrado');
    }

    let passwordHash: string | undefined;
    if (input.password) {
      passwordHash = await this.passwordHasher.hash(input.password);
    }

    const user = await this.userRepository.update(id, {
      name: input.name,
      email: input.email,
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
    await this.userRepository.delete(id);
  }
}
