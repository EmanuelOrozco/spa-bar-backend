import { z } from 'zod';

const tableStatusSchema = z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']);

export const createTableSchema = z.object({
  number: z.string().trim().min(1).max(20),
  name: z.string().trim().min(2).max(100),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  status: tableStatusSchema.optional(),
  location: z.string().trim().max(100).optional().nullable(),
});

export const updateTableSchema = createTableSchema.partial();

export const updateTableStatusSchema = z.object({
  status: tableStatusSchema,
});

export const tableIdParamSchema = z.object({
  id: z.string().uuid('ID de mesa inválido'),
});

export const tableQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  status: tableStatusSchema.optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
