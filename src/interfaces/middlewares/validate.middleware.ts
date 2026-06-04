import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';

type RequestSource = 'body' | 'query' | 'params';

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'general';
    if (!details[key]) details[key] = [];
    details[key].push(issue.message);
  }
  return details;
}

export function validate(schema: ZodSchema, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError('Datos inválidos', formatZodError(result.error)));
    }
    req[source] = result.data;
    next();
  };
}
