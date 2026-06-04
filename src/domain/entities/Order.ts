import { OrderStatus } from '../../shared/types';

export interface OrderItemProps {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productDescription: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class OrderItem {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly productDescription: string | null;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly subtotal: number;

  constructor(props: OrderItemProps) {
    Object.assign(this, props);
  }
}

export interface OrderProps {
  id: string;
  orderNumber: number;
  tableId: string | null;
  tableName: string | null;
  userId: string;
  userName: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  readonly id: string;
  readonly orderNumber: number;
  readonly tableId: string | null;
  readonly tableName: string | null;
  readonly userId: string;
  readonly userName: string;
  readonly status: OrderStatus;
  readonly total: number;
  readonly notes: string | null;
  readonly items: OrderItem[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: OrderProps) {
    Object.assign(this, props);
  }
}
