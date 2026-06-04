import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { ApiResponse } from '../../shared/types';

const PRISMA_MESSAGES: Record<string, { status: number; message: string }> = {
  P2002: { status: 409, message: 'El registro ya existe' },
  P2003: { status: 400, message: 'Referencia inválida: el registro relacionado no existe' },
  P2014: { status: 400, message: 'La relación es obligatoria y no puede eliminarse' },
  P2025: { status: 404, message: 'Recurso no encontrado' },
};

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ValidationError) {
    const body: ApiResponse & { details?: Record<string, string[]> } = {
      success: false,
      message: error.message,
      details: error.details,
    };
    return res.status(error.statusCode).json(body);
  }

  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      message: error.message,
    };
    return res.status(error.statusCode).json(body);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_MESSAGES[error.code];
    if (mapped) {
      return res.status(mapped.status).json({
        success: false,
        message: mapped.message,
      });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos para la operación solicitada',
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
}
