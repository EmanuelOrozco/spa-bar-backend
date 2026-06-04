export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type Role = 'admin' | 'employee';

export type ProductCategory =
  | 'COCKTAILS'
  | 'BEERS'
  | 'APPETIZERS'
  | 'MAINS'
  | 'LIQUOR'
  | 'FRUITS'
  | 'SOFT_DRINKS'
  | 'SUPPLIES';

export type ProductStatus = 'ACTIVE' | 'LOW_STOCK' | 'INACTIVE';

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING_BAR'
  | 'PREPARING_KITCHEN'
  | 'DELIVERED'
  | 'CANCELLED';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
}
