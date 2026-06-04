import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';
import { Table } from '../../domain/entities/Table';
import {
  TableRepository,
  CreateTableData,
  UpdateTableData,
  TableFilters,
} from '../../domain/repositories/TableRepository';
import { TableStatus } from '../../shared/types';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError';

function mapTable(record: {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: string;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Table {
  return new Table({
    ...record,
    status: record.status as TableStatus,
  });
}

export class PrismaTableRepository implements TableRepository {
  async findById(id: string): Promise<Table | null> {
    const record = await prisma.table.findUnique({ where: { id } });
    return record ? mapTable(record) : null;
  }

  async findByNumber(number: string): Promise<Table | null> {
    const record = await prisma.table.findUnique({ where: { number } });
    return record ? mapTable(record) : null;
  }

  async findAll(filters: TableFilters) {
    const where: Prisma.TableWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { number: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.status) where.status = filters.status;

    const skip = (filters.page - 1) * filters.limit;

    const [records, total] = await Promise.all([
      prisma.table.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { number: 'asc' },
      }),
      prisma.table.count({ where }),
    ]);

    return { tables: records.map(mapTable), total };
  }

  async create(data: CreateTableData): Promise<Table> {
    const record = await prisma.table.create({
      data: {
        number: data.number,
        name: data.name,
        capacity: data.capacity ?? 4,
        status: data.status ?? 'AVAILABLE',
        location: data.location ?? null,
      },
    });
    return mapTable(record);
  }

  async update(id: string, data: UpdateTableData): Promise<Table> {
    try {
      const record = await prisma.table.update({
        where: { id },
        data: {
          ...(data.number !== undefined && { number: data.number }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.capacity !== undefined && { capacity: data.capacity }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.location !== undefined && { location: data.location }),
        },
      });
      return mapTable(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Mesa no encontrada');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.table.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') throw new NotFoundError('Mesa no encontrada');
        if (error.code === 'P2003') {
          throw new ConflictError(
            'No se puede eliminar la mesa porque tiene reservas asociadas. Cancélalas primero.'
          );
        }
      }
      throw error;
    }
  }

  async countByStatus(status: TableStatus): Promise<number> {
    return prisma.table.count({ where: { status } });
  }
}
