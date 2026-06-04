import { Order } from '../entities/Order';
import { OrderStatus, PaginationParams } from '../../shared/types';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderData {
  userId: string;
  tableId?: string | null;
  status?: OrderStatus;
  notes?: string | null;
  items: OrderItemInput[];
}

export interface UpdateOrderData {
  tableId?: string | null;
  status?: OrderStatus;
  notes?: string | null;
  items?: OrderItemInput[];
}

export interface OrderFilters extends PaginationParams {
  search?: string;
  status?: OrderStatus;
  userId?: string;
  tableId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;
  create(data: CreateOrderData): Promise<Order>;
  update(id: string, data: UpdateOrderData): Promise<Order>;
  delete(id: string): Promise<void>;
  getStats(): Promise<{
    todaySales: number;
    todayOrders: number;
    weekSales: number;
    avgTicket: number;
  }>;
}
