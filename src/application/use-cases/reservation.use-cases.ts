import {
  ReservationRepository,
  ReservationFilters,
  UpdateReservationData,
} from '../../domain/repositories/ReservationRepository';
import { CreateReservationInput, UpdateReservationInput } from '../dto/reservation.dto';
import { NotFoundError } from '../../shared/errors/AppError';

export class ListReservationsUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  execute(filters: ReservationFilters) {
    return this.reservationRepository.findAll(filters);
  }
}

export class GetReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(id: string) {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) throw new NotFoundError('Reserva no encontrada');
    return reservation;
  }
}

export class CreateReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  execute(userId: string, input: CreateReservationInput) {
    return this.reservationRepository.create({
      userId,
      tableId: input.tableId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      guestCount: input.guestCount,
      reservedAt: new Date(input.reservedAt),
      status: input.status,
      notes: input.notes,
    });
  }
}

export class UpdateReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  execute(id: string, input: UpdateReservationInput) {
    const { reservedAt, ...rest } = input;
    const data: UpdateReservationData = { ...rest };
    if (reservedAt !== undefined) {
      data.reservedAt = new Date(reservedAt);
    }
    return this.reservationRepository.update(id, data);
  }
}

export class DeleteReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(id: string) {
    const existing = await this.reservationRepository.findById(id);
    if (!existing) throw new NotFoundError('Reserva no encontrada');
    await this.reservationRepository.delete(id);
  }
}
