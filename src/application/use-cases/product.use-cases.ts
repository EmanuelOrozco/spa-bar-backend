import { ProductRepository, ProductFilters } from '../../domain/repositories/ProductRepository';
import { CreateProductInput, UpdateProductInput } from '../dto/product.dto';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(filters: ProductFilters) {
    return this.productRepository.findAll(filters);
  }
}

export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput) {
    const existing = await this.productRepository.findBySku(input.sku);
    if (existing) throw new ConflictError('El SKU ya existe');
    return this.productRepository.create(input);
  }
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput) {
    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');

    if (input.sku && input.sku !== existing.sku) {
      const skuTaken = await this.productRepository.findBySku(input.sku);
      if (skuTaken) throw new ConflictError('El SKU ya existe');
    }

    return this.productRepository.update(id, input);
  }
}

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');
    await this.productRepository.delete(id);
  }
}

export class GetLowStockProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(limit = 5) {
    return this.productRepository.findAll({
      page: 1,
      limit,
      lowStock: true,
      isMenuItem: true,
    });
  }
}
