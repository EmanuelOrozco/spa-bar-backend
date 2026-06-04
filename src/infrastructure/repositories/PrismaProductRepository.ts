import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { prisma } from '../prisma/client';
import { Product, computeProductStatus } from '../../domain/entities/Product';
import {
  ProductRepository,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
} from '../../domain/repositories/ProductRepository';
import { ProductCategory, ProductStatus } from '../../shared/types';
import { NotFoundError } from '../../shared/errors/AppError';
import { toNumber } from '../../shared/utils/pagination';

function mapProduct(record: PrismaProduct, options?: { includeImage?: boolean }): Product {
  const includeImage = options?.includeImage ?? true;
  const hasImage = Boolean(record.imageData);

  return new Product({
    id: record.id,
    sku: record.sku,
    name: record.name,
    description: record.description,
    category: record.category as ProductCategory,
    price: toNumber(record.price),
    stock: record.stock,
    minStock: record.minStock,
    unit: record.unit,
    status: record.status as ProductStatus,
    imageData: includeImage ? record.imageData : null,
    hasImage,
    isMenuItem: record.isMenuItem,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const record = await prisma.product.findUnique({ where: { id } });
    return record ? mapProduct(record, { includeImage: true }) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const record = await prisma.product.findUnique({ where: { sku } });
    return record ? mapProduct(record, { includeImage: true }) : null;
  }

  async findAll(filters: ProductFilters) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.isMenuItem !== undefined) where.isMenuItem = filters.isMenuItem;
    if (filters.lowStock) {
      where.status = 'LOW_STOCK';
    }

    const skip = (filters.page - 1) * filters.limit;
    const includeImage = filters.includeImage ?? (filters.isMenuItem === true ? true : false);

    const [records, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: records.map((record) => mapProduct(record, { includeImage })),
      total,
    };
  }

  async create(data: CreateProductData): Promise<Product> {
    const stock = data.stock ?? 0;
    const minStock = data.minStock ?? 0;
    const status = data.status ?? computeProductStatus(stock, minStock);

    const record = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
        price: data.price,
        stock,
        minStock,
        unit: data.unit ?? 'unidad',
        status,
        imageData: data.imageData ?? null,
        isMenuItem: data.isMenuItem ?? true,
      },
    });
    return mapProduct(record, { includeImage: true });
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    try {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) throw new NotFoundError('Producto no encontrado');

      const stock = data.stock ?? existing.stock;
      const minStock = data.minStock ?? existing.minStock;
      const status = data.status ?? computeProductStatus(stock, minStock);

      const record = await prisma.product.update({
        where: { id },
        data: {
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.minStock !== undefined && { minStock: data.minStock }),
          ...(data.unit !== undefined && { unit: data.unit }),
          status,
          ...(data.imageData !== undefined && { imageData: data.imageData }),
          ...(data.isMenuItem !== undefined && { isMenuItem: data.isMenuItem }),
        },
      });
      return mapProduct(record, { includeImage: true });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Producto no encontrado');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Producto no encontrado');
      }
      throw error;
    }
  }

  async countLowStock(): Promise<number> {
    const products = await prisma.product.findMany({
      where: { isMenuItem: true },
      select: { stock: true, minStock: true },
    });
    return products.filter((p) => p.stock <= p.minStock).length;
  }
}
