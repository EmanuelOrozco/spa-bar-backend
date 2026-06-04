import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { Reservation } from '../../domain/entities/Reservation';
import {
  ReservationRepository,
  CreateReservationData,
  UpdateReservationData,
  ReservationFilters,
} from '../../domain/repositories/ReservationRepository';
import { ReservationStatus } from '../../shared/types';
import { NotFoundError } from '../../shared/errors/AppError';

type ReservationWithRelations = Prisma.ReservationGetPayload<{
  include: { table: true; user: true };
}>;

function mapReservation(record: ReservationWithRelations): Reservation {
  return new Reservation({
    id: record.id,
    tableId: record.tableId,
    tableName: record.table.name,
    userId: record.userId,
    userName: record.user.name,
    customerName: record.customerName,
    customerPhone: record.customerPhone,
    guestCount: record.guestCount,
    reservedAt: record.reservedAt,
    status: record.status as ReservationStatus,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

const includeRelations = { table: true, user: true } as const;

export class PrismaReservationRepository implements ReservationRepository {
  async findById(id: string): Promise<Reservation | null> {
    const record = await prisma.reservation.findUnique({
      where: { id },
      include: includeRelations,
    });
    return record ? mapReservation(record) : null;
  }

  async findAll(filters: ReservationFilters) {
    const where: Prisma.ReservationWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.dateFrom || filters.dateTo) {
      where.reservedAt = {};
      if (filters.dateFrom) where.reservedAt.gte = filters.dateFrom;
      if (filters.dateTo) where.reservedAt.lte = filters.dateTo;
    }
    if (filters.search) {
      where.OR = [
        { customerName: { contains: filters.search, mode: 'insensitive' } },
        { customerPhone: { contains: filters.search, mode: 'insensitive' } },
        { notes: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [records, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { reservedAt: 'asc' },
        include: includeRelations,
      }),
      prisma.reservation.count({ where }),
    ]);

    return { reservations: records.map(mapReservation), total };
  }

  async create(data: CreateReservationData): Promise<Reservation> {
    const record = await prisma.reservation.create({
      data: {
        tableId: data.tableId,
        userId: data.userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone ?? null,
        guestCount: data.guestCount,
        reservedAt: data.reservedAt,
        status: data.status ?? 'PENDING',
        notes: data.notes ?? null,
      },
      include: includeRelations,
    });
    return mapReservation(record);
  }

  async update(id: string, data: UpdateReservationData): Promise<Reservation> {
    try {
      const record = await prisma.reservation.update({
        where: { id },
        data: {
          ...(data.tableId !== undefined && { tableId: data.tableId }),
          ...(data.customerName !== undefined && { customerName: data.customerName }),
          ...(data.customerPhone !== undefined && { customerPhone: data.customerPhone }),
          ...(data.guestCount !== undefined && { guestCount: data.guestCount }),
          ...(data.reservedAt !== undefined && { reservedAt: data.reservedAt }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
        include: includeRelations,
      });
      return mapReservation(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Reserva no encontrada');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.reservation.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Reserva no encontrada');
      }
      throw error;
    }
  }
}
