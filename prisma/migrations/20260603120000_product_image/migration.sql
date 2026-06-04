-- Reemplazar emoji por imagen almacenada en base de datos (data URL base64)
ALTER TABLE "products" DROP COLUMN IF EXISTS "emoji";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_data" TEXT;
