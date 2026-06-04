import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { User, toPublicUser } from '../../domain/entities/User';
import {
  UserRepository,
  CreateUserData,
  UpdateUserData,
  UserFilters,
} from '../../domain/repositories/UserRepository';
import { Role } from '../../shared/types';
import { NotFoundError } from '../../shared/errors/AppError';

function mapUser(record: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  position: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return new User({
    ...record,
    role: record.role as Role,
  });
}

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } });
    return record ? mapUser(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return record ? mapUser(record) : null;
  }

  async findAll(filters: UserFilters) {
    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { position: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const skip = (filters.page - 1) * filters.limit;

    const [records, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: records.map((r) => toPublicUser(mapUser(r))),
      total,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const record = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role ?? 'employee',
        position: data.position ?? null,
      },
    });
    return mapUser(record);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const record = await prisma.user.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email.toLowerCase() }),
          ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.position !== undefined && { position: data.position }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      return mapUser(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Usuario no encontrado');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Usuario no encontrado');
      }
      throw error;
    }
  }

  async countActive(): Promise<number> {
    return prisma.user.count({ where: { isActive: true } });
  }
}
