import { Request, Response, NextFunction } from 'express';
import { PrismaProductRepository } from '../../infrastructure/repositories/PrismaProductRepository';
import {
  ListProductsUseCase,
  GetProductUseCase,
  CreateProductUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
} from '../../application/use-cases/product.use-cases';
import { buildPaginationMeta, parsePaginationQuery } from '../../shared/utils/pagination';
import { sendCreated, sendNoContent, sendSuccess } from '../../shared/utils/response';
import { ProductCategory, ProductStatus } from '../../shared/types';
import { NotFoundError } from '../../shared/errors/AppError';

function isEmployee(req: Request) {
  return req.user?.role !== 'admin';
}

function assertEmployeeCanAccessProduct(req: Request, product: { isMenuItem: boolean }) {
  if (isEmployee(req) && !product.isMenuItem) {
    throw new NotFoundError('Producto no encontrado');
  }
}

const productRepository = new PrismaProductRepository();

const listProducts = new ListProductsUseCase(productRepository);
const getProduct = new GetProductUseCase(productRepository);
const createProduct = new CreateProductUseCase(productRepository);
const updateProduct = new UpdateProductUseCase(productRepository);
const deleteProduct = new DeleteProductUseCase(productRepository);

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query.page, req.query.limit);
    const query = req.query as {
      search?: string;
      category?: ProductCategory;
      status?: ProductStatus;
      isMenuItem?: boolean;
      lowStock?: boolean;
      includeImage?: boolean;
    };

    const includeImage = query.includeImage ?? (query.isMenuItem === true ? true : undefined);

    const isMenuItem = isEmployee(req) ? true : query.isMenuItem;

    const result = await listProducts.execute({
      page,
      limit,
      search: query.search,
      category: query.category,
      status: query.status,
      isMenuItem,
      lowStock: query.lowStock,
      includeImage,
    });

    sendSuccess(
      res,
      'Productos obtenidos',
      result.products,
      200,
      buildPaginationMeta(result.total, page, limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await getProduct.execute(req.params.id);
    assertEmployeeCanAccessProduct(req, product);
    sendSuccess(res, 'Producto obtenido', product);
  } catch (error) {
    next(error);
  }
}

export async function postProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await createProduct.execute(req.body);
    sendCreated(res, 'Producto creado exitosamente', product);
  } catch (error) {
    next(error);
  }
}

export async function putProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await getProduct.execute(req.params.id);
    assertEmployeeCanAccessProduct(req, existing);
    const product = await updateProduct.execute(req.params.id, req.body);
    sendSuccess(res, 'Producto actualizado exitosamente', product);
  } catch (error) {
    next(error);
  }
}

export async function removeProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteProduct.execute(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
