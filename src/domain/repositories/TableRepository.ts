import { Table } from '../entities/Table';
import { TableStatus, PaginationParams } from '../../shared/types';

export interface CreateTableData {
  number: string;
  name: string;
  capacity?: number;
  status?: TableStatus;
  location?: string | null;
}

export interface UpdateTableData {
  number?: string;
  name?: string;
  capacity?: number;
  status?: TableStatus;
  location?: string | null;
}

export interface TableFilters extends PaginationParams {
  search?: string;
  status?: TableStatus;
}

export interface TableRepository {
  findById(id: string): Promise<Table | null>;
  findByNumber(number: string): Promise<Table | null>;
  findAll(filters: TableFilters): Promise<{ tables: Table[]; total: number }>;
  create(data: CreateTableData): Promise<Table>;
  update(id: string, data: UpdateTableData): Promise<Table>;
  delete(id: string): Promise<void>;
  countByStatus(status: TableStatus): Promise<number>;
}
