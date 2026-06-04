import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../infrastructure/services/BcryptPasswordHasher';
import {
  ListUsersUseCase,
  GetUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from '../../application/use-cases/user.use-cases';
import { buildPaginationMeta, parsePaginationQuery } from '../../shared/utils/pagination';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/response';

const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();

const listUsers = new ListUsersUseCase(userRepository);
const getUser = new GetUserUseCase(userRepository);
const createUser = new CreateUserUseCase(userRepository, passwordHasher);
const updateUser = new UpdateUserUseCase(userRepository, passwordHasher);
const deleteUser = new DeleteUserUseCase(userRepository);

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query.page, req.query.limit);
    const query = req.query as {
      search?: string;
      role?: 'admin' | 'employee';
      isActive?: boolean;
    };

    const result = await listUsers.execute({
      page,
      limit,
      search: query.search,
      role: query.role,
      isActive: query.isActive,
    });

    sendSuccess(
      res,
      'Usuarios obtenidos',
      result.users,
      200,
      buildPaginationMeta(result.total, page, limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUser.execute(req.params.id);
    sendSuccess(res, 'Usuario obtenido', user);
  } catch (error) {
    next(error);
  }
}

export async function postUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await createUser.execute(req.body);
    sendCreated(res, 'Usuario creado exitosamente', user);
  } catch (error) {
    next(error);
  }
}

export async function putUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUser.execute(req.params.id, req.body);
    sendSuccess(res, 'Usuario actualizado exitosamente', user);
  } catch (error) {
    next(error);
  }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteUser.execute(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
