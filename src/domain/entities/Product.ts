import { ProductCategory, ProductStatus } from '../../shared/types';

export interface ProductProps {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  status: ProductStatus;
  imageData: string | null;
  hasImage?: boolean;
  isMenuItem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: ProductCategory;
  readonly price: number;
  readonly stock: number;
  readonly minStock: number;
  readonly unit: string;
  readonly status: ProductStatus;
  readonly imageData: string | null;
  readonly hasImage?: boolean;
  readonly isMenuItem: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ProductProps) {
    Object.assign(this, props);
  }
}

export function computeProductStatus(stock: number, minStock: number): ProductStatus {
  if (stock <= 0) return 'INACTIVE';
  if (stock <= minStock) return 'LOW_STOCK';
  return 'ACTIVE';
}
