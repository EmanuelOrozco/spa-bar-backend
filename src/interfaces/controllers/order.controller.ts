import { Request, Response, NextFunction } from 'express';
import { PrismaOrderRepository } from '../../infrastructure/repositories/PrismaOrderRepository';
import { PrismaProductRepository } from '../../infrastructure/repositories/PrismaProductRepository';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { PrismaTableRepository } from '../../infrastructure/repositories/PrismaTableRepository';
import {
  ListOrdersUseCase,
  GetOrderUseCase,
  CreateOrderUseCase,
  UpdateOrderUseCase,
  DeleteOrderUseCase,
  GetOrderStatsUseCase,
  GetDashboardStatsUseCase,
} from '../../application/use-cases/order.use-cases';
import { buildPaginationMeta, parsePaginationQuery } from '../../shared/utils/pagination';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/response';
import { OrderStatus } from '../../shared/types';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AppError';
import { Order } from '../../domain/entities/Order';

function isAdmin(req: Request) {
  return req.user?.role === 'admin';
}

function employeeUserId(req: Request): string | undefined {
  if (!req.user) return undefined;
  return isAdmin(req) ? undefined : req.user.userId;
}

function assertOrderAccess(req: Request, order: Order) {
  if (!req.user) throw new UnauthorizedError();
  if (isAdmin(req)) return;
  if (order.userId !== req.user.userId) {
    throw new ForbiddenError('No tienes permiso para acceder a este pedido');
  }
}

const orderRepository = new PrismaOrderRepository();
const productRepository = new PrismaProductRepository();
const userRepository = new PrismaUserRepository();
const tableRepository = new PrismaTableRepository();

const listOrders = new ListOrdersUseCase(orderRepository);
const getOrder = new GetOrderUseCase(orderRepository);
const createOrder = new CreateOrderUseCase(orderRepository);
const updateOrder = new UpdateOrderUseCase(orderRepository);
const deleteOrder = new DeleteOrderUseCase(orderRepository);
const getOrderStats = new GetOrderStatsUseCase(orderRepository);
const getDashboardStats = new GetDashboardStatsUseCase(
  orderRepository,
  productRepository,
  userRepository,
  tableRepository
);

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query.page, req.query.limit);
    const query = req.query as {
      search?: string;
      status?: OrderStatus;
      tableId?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    const result = await listOrders.execute({
      page,
      limit,
      search: query.search,
      status: query.status,
      userId: employeeUserId(req),
      tableId: query.tableId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });

    sendSuccess(
      res,
      'Pedidos obtenidos',
      result.orders,
      200,
      buildPaginationMeta(result.total, page, limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await getOrder.execute(req.params.id);
    assertOrderAccess(req, order);
    sendSuccess(res, 'Pedido obtenido', order);
  } catch (error) {
    next(error);
  }
}

export async function postOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const order = await createOrder.execute(req.user.userId, req.body);
    sendCreated(res, 'Pedido creado exitosamente', order);
  } catch (error) {
    next(error);
  }
}

export async function putOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await getOrder.execute(req.params.id);
    assertOrderAccess(req, existing);
    const order = await updateOrder.execute(req.params.id, req.body);
    sendSuccess(res, 'Pedido actualizado exitosamente', order);
  } catch (error) {
    next(error);
  }
}

export async function removeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteOrder.execute(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const stats = await getOrderStats.execute(employeeUserId(req));
    sendSuccess(res, 'Estadísticas de ventas obtenidas', stats);
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await getDashboardStats.execute();
    sendSuccess(res, 'Estadísticas del dashboard obtenidas', stats);
  } catch (error) {
    next(error);
  }
}
