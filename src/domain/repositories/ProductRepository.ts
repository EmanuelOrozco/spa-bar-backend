import { Product } from '../entities/Product';
import { ProductCategory, ProductStatus, PaginationParams } from '../../shared/types';

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  price: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  status?: ProductStatus;
  imageData?: string | null;
  isMenuItem?: boolean;
}

export interface UpdateProductData {
  sku?: string;
  name?: string;
  description?: string | null;
  category?: ProductCategory;
  price?: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  status?: ProductStatus;
  imageData?: string | null;
  isMenuItem?: boolean;
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  isMenuItem?: boolean;
  lowStock?: boolean;
  includeImage?: boolean;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(filters: ProductFilters): Promise<{ products: Product[]; total: number }>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
  countLowStock(): Promise<number>;
}
