import { Reservation } from '../entities/Reservation';
import { ReservationStatus, PaginationParams } from '../../shared/types';

export interface CreateReservationData {
  tableId: string;
  userId: string;
  customerName: string;
  customerPhone?: string | null;
  guestCount: number;
  reservedAt: Date;
  status?: ReservationStatus;
  notes?: string | null;
}

export interface UpdateReservationData {
  tableId?: string;
  customerName?: string;
  customerPhone?: string | null;
  guestCount?: number;
  reservedAt?: Date;
  status?: ReservationStatus;
  notes?: string | null;
}

export interface ReservationFilters extends PaginationParams {
  search?: string;
  status?: ReservationStatus;
  tableId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findAll(filters: ReservationFilters): Promise<{ reservations: Reservation[]; total: number }>;
  create(data: CreateReservationData): Promise<Reservation>;
  update(id: string, data: UpdateReservationData): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
