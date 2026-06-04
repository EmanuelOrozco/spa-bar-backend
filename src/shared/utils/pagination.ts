import { PaginationMeta } from '../types';

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function parsePaginationQuery(
  pageRaw: unknown,
  limitRaw: unknown
): { page: number; limit: number } {
  const page = Math.max(1, parseInt(String(pageRaw ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(limitRaw ?? '10'), 10) || 10));
  return { page, limit };
}

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}
