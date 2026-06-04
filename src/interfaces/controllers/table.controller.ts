import { Request, Response, NextFunction } from 'express';
import { PrismaTableRepository } from '../../infrastructure/repositories/PrismaTableRepository';
import {
  ListTablesUseCase,
  GetTableUseCase,
  CreateTableUseCase,
  UpdateTableUseCase,
  DeleteTableUseCase,
} from '../../application/use-cases/table.use-cases';
import { buildPaginationMeta, parsePaginationQuery } from '../../shared/utils/pagination';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/response';
import { TableStatus } from '../../shared/types';

const tableRepository = new PrismaTableRepository();

const listTables = new ListTablesUseCase(tableRepository);
const getTable = new GetTableUseCase(tableRepository);
const createTable = new CreateTableUseCase(tableRepository);
const updateTable = new UpdateTableUseCase(tableRepository);
const deleteTable = new DeleteTableUseCase(tableRepository);

export async function getTables(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query.page, req.query.limit);
    const query = req.query as { search?: string; status?: TableStatus };

    const result = await listTables.execute({
      page,
      limit,
      search: query.search,
      status: query.status,
    });

    sendSuccess(
      res,
      'Mesas obtenidas',
      result.tables,
      200,
      buildPaginationMeta(result.total, page, limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getTableById(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await getTable.execute(req.params.id);
    sendSuccess(res, 'Mesa obtenida', table);
  } catch (error) {
    next(error);
  }
}

export async function postTable(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await createTable.execute(req.body);
    sendCreated(res, 'Mesa creada exitosamente', table);
  } catch (error) {
    next(error);
  }
}

export async function putTable(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await updateTable.execute(req.params.id, req.body);
    sendSuccess(res, 'Mesa actualizada exitosamente', table);
  } catch (error) {
    next(error);
  }
}

export async function patchTableStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const table = await updateTable.execute(req.params.id, { status: req.body.status });
    sendSuccess(res, 'Estado de mesa actualizado', table);
  } catch (error) {
    next(error);
  }
}

export async function removeTable(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteTable.execute(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
