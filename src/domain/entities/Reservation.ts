import { ReservationStatus } from '../../shared/types';

export interface ReservationProps {
  id: string;
  tableId: string;
  tableName: string;
  userId: string;
  userName: string;
  customerName: string;
  customerPhone: string | null;
  guestCount: number;
  reservedAt: Date;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Reservation {
  readonly id: string;
  readonly tableId: string;
  readonly tableName: string;
  readonly userId: string;
  readonly userName: string;
  readonly customerName: string;
  readonly customerPhone: string | null;
  readonly guestCount: number;
  readonly reservedAt: Date;
  readonly status: ReservationStatus;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ReservationProps) {
    Object.assign(this, props);
  }
}
