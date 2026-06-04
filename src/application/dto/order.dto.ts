import { z } from 'zod';

const orderStatusSchema = z.enum([
  'PENDING',
  'PREPARING_BAR',
  'PREPARING_KITCHEN',
  'DELIVERED',
  'CANCELLED',
]);

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

export const createOrderSchema = z.object({
  tableId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v)),
  status: orderStatusSchema.optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
});

export const updateOrderSchema = z.object({
  tableId: z.string().uuid().optional().nullable(),
  status: orderStatusSchema.optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1).optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().uuid('ID de pedido inválido'),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  status: orderStatusSchema.optional(),
  tableId: z.string().uuid().optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
