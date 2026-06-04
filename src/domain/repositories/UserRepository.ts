import { User, PublicUser } from '../entities/User';
import { Role } from '../../shared/types';
import { PaginationParams } from '../../shared/types';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
  position?: string | null;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: Role;
  position?: string | null;
  isActive?: boolean;
}

export interface UserFilters extends PaginationParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters: UserFilters): Promise<{ users: PublicUser[]; total: number }>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  countActive(): Promise<number>;
}
