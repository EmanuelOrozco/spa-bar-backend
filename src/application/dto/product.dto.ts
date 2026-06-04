import { z } from 'zod';
import { imageDataSchema } from '../../shared/utils/imageData';

const categorySchema = z.enum([
  'COCKTAILS',
  'BEERS',
  'APPETIZERS',
  'MAINS',
  'LIQUOR',
  'FRUITS',
  'SOFT_DRINKS',
  'SUPPLIES',
]);

const statusSchema = z.enum(['ACTIVE', 'LOW_STOCK', 'INACTIVE']);

export const createProductSchema = z.object({
  sku: z.string().trim().min(2).max(50),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional().nullable(),
  category: categorySchema,
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z.coerce.number().int().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  unit: z.string().trim().max(30).optional(),
  status: statusSchema.optional(),
  imageData: imageDataSchema,
  isMenuItem: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().uuid('ID de producto inválido'),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  category: categorySchema.optional(),
  status: statusSchema.optional(),
  isMenuItem: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  lowStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  includeImage: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
