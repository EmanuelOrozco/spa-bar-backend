import { Request, Response, NextFunction } from 'express';
import { PrismaReservationRepository } from '../../infrastructure/repositories/PrismaReservationRepository';
import {
  ListReservationsUseCase,
  GetReservationUseCase,
  CreateReservationUseCase,
  UpdateReservationUseCase,
  DeleteReservationUseCase,
} from '../../application/use-cases/reservation.use-cases';
import { buildPaginationMeta, parsePaginationQuery } from '../../shared/utils/pagination';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/response';
import { ReservationStatus } from '../../shared/types';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/AppError';

const reservationRepository = new PrismaReservationRepository();

const listReservations = new ListReservationsUseCase(reservationRepository);
const getReservation = new GetReservationUseCase(reservationRepository);
const createReservation = new CreateReservationUseCase(reservationRepository);
const updateReservation = new UpdateReservationUseCase(reservationRepository);
const deleteReservation = new DeleteReservationUseCase(reservationRepository);

export async function getReservations(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query.page, req.query.limit);
    const query = req.query as {
      search?: string;
      status?: ReservationStatus;
      tableId?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    const result = await listReservations.execute({
      page,
      limit,
      search: query.search,
      status: query.status,
      tableId: query.tableId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
    });

    sendSuccess(
      res,
      'Reservas obtenidas',
      result.reservations,
      200,
      buildPaginationMeta(result.total, page, limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getReservationById(req: Request, res: Response, next: NextFunction) {
  try {
    const reservation = await getReservation.execute(req.params.id);
    sendSuccess(res, 'Reserva obtenida', reservation);
  } catch (error) {
    next(error);
  }
}

export async function postReservation(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const reservation = await createReservation.execute(req.user.userId, req.body);
    sendCreated(res, 'Reserva creada exitosamente', reservation);
  } catch (error) {
    next(error);
  }
}

async function assertReservationAccess(req: Request, reservationId: string) {
  if (!req.user) throw new UnauthorizedError();
  if (req.user.role === 'admin') return;
  const reservation = await getReservation.execute(reservationId);
  if (reservation.userId !== req.user.userId) {
    throw new ForbiddenError('No tienes permiso para modificar esta reserva');
  }
}

export async function putReservation(req: Request, res: Response, next: NextFunction) {
  try {
    await assertReservationAccess(req, req.params.id);
    const reservation = await updateReservation.execute(req.params.id, req.body);
    sendSuccess(res, 'Reserva actualizada exitosamente', reservation);
  } catch (error) {
    next(error);
  }
}

export async function removeReservation(req: Request, res: Response, next: NextFunction) {
  try {
    await assertReservationAccess(req, req.params.id);
    await deleteReservation.execute(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
