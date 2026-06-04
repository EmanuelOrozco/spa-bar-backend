import {
  ReservationRepository,
  ReservationFilters,
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
    return this.reservationRepository.update(id, {
      ...input,
      ...(input.reservedAt && { reservedAt: new Date(input.reservedAt) }),
    });
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
