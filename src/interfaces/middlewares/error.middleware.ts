import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { ApiResponse } from '../../shared/types';

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
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'El registro ya existe',
      });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
      });
    }
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
