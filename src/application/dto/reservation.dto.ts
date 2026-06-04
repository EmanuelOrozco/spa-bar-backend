import { z } from 'zod';

const reservationStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

export const createReservationSchema = z.object({
  tableId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().max(20).optional().nullable(),
  guestCount: z.coerce.number().int().min(1).max(50),
  reservedAt: z.string().min(1),
  status: reservationStatusSchema.optional(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const updateReservationSchema = createReservationSchema.partial();

export const reservationIdParamSchema = z.object({
  id: z.string().uuid('ID de reserva inválido'),
});

export const reservationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  status: reservationStatusSchema.optional(),
  tableId: z.string().uuid().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
