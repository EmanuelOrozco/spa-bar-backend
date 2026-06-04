import { z } from 'zod';

const DATA_URL_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export const imageDataSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return value;
  })
  .refine(
    (value) => value === undefined || value === null || DATA_URL_REGEX.test(value),
    'La imagen debe ser JPEG, PNG o WebP en formato base64'
  )
  .refine(
    (value) => value === undefined || value === null || value.length <= 2_800_000,
    'La imagen supera el tamaño máximo permitido (2 MB aprox.)'
  );
