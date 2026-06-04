import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { Order, OrderItem } from '../../domain/entities/Order';
import {
  OrderRepository,
  CreateOrderData,
  UpdateOrderData,
  OrderFilters,
} from '../../domain/repositories/OrderRepository';
import { OrderStatus } from '../../shared/types';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { toNumber } from '../../shared/utils/pagination';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    table: true;
    user: true;
  };
}>;

function mapOrder(record: OrderWithRelations): Order {
  return new Order({
    id: record.id,
    orderNumber: record.orderNumber,
    tableId: record.tableId,
    tableName: record.table?.name ?? null,
    userId: record.userId,
    userName: record.user.name,
    status: record.status as OrderStatus,
    total: toNumber(record.total),
    notes: record.notes,
    items: record.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: toNumber(item.unitPrice),
          subtotal: toNumber(item.subtotal),
        })
    ),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

const includeRelations = {
  items: { include: { product: true } },
  table: true,
  user: true,
} as const;

export class PrismaOrderRepository implements OrderRepository {
  async findById(id: string): Promise<Order | null> {
    const record = await prisma.order.findUnique({
      where: { id },
      include: includeRelations,
    });
    return record ? mapOrder(record) : null;
  }

  async findAll(filters: OrderFilters) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { notes: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { table: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [records, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: includeRelations,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders: records.map(mapOrder), total };
  }

  async create(data: CreateOrderData): Promise<Order> {
    if (!data.items.length) {
      throw new ValidationError('El pedido debe tener al menos un item');
    }

    const record = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map((i) => i.productId) } },
      });

      if (products.length !== data.items.length) {
        throw new ValidationError('Uno o más productos no existen');
      }

      let total = 0;
      const itemsData = data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const unitPrice = toNumber(product.price);
        const subtotal = unitPrice * item.quantity;
        total += subtotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        };
      });

      const order = await tx.order.create({
        data: {
          userId: data.userId,
          tableId: data.tableId ?? null,
          status: data.status ?? 'PENDING',
          notes: data.notes ?? null,
          total,
          items: { create: itemsData },
        },
        include: includeRelations,
      });

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });

    return mapOrder(record);
  }

  async update(id: string, data: UpdateOrderData): Promise<Order> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    if (data.items) {
      const record = await prisma.$transaction(async (tx) => {
        await tx.orderItem.deleteMany({ where: { orderId: id } });

        const products = await tx.product.findMany({
          where: { id: { in: data.items!.map((i) => i.productId) } },
        });

        let total = 0;
        const itemsData = data.items!.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          const unitPrice = toNumber(product.price);
          const subtotal = unitPrice * item.quantity;
          total += subtotal;
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            subtotal,
          };
        });

        const order = await tx.order.update({
          where: { id },
          data: {
            ...(data.tableId !== undefined && { tableId: data.tableId }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.notes !== undefined && { notes: data.notes }),
            total,
            items: { create: itemsData },
          },
          include: includeRelations,
        });

        return order;
      });
      return mapOrder(record);
    }

    const record = await prisma.order.update({
      where: { id },
      data: {
        ...(data.tableId !== undefined && { tableId: data.tableId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: includeRelations,
    });

    return mapOrder(record);
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.order.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Pedido no encontrado');
      }
      throw error;
    }
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayOrders, weekOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: weekAgo }, status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
    ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + toNumber(o.total), 0);
    const weekSales = weekOrders.reduce((sum, o) => sum + toNumber(o.total), 0);
    const avgTicket = weekOrders.length ? weekSales / weekOrders.length : 0;

    return {
      todaySales,
      todayOrders: todayOrders.length,
      weekSales,
      avgTicket,
    };
  }
}
