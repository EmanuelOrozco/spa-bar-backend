import { OrderRepository, OrderFilters } from '../../domain/repositories/OrderRepository';
import { CreateOrderInput, UpdateOrderInput } from '../dto/order.dto';
import { NotFoundError } from '../../shared/errors/AppError';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(filters: OrderFilters) {
    return this.orderRepository.findAll(filters);
  }
}

export class GetOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    return order;
  }
}

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(userId: string, input: CreateOrderInput) {
    return this.orderRepository.create({
      userId,
      tableId: input.tableId,
      status: input.status,
      notes: input.notes,
      items: input.items,
    });
  }
}

export class UpdateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute(id: string, input: UpdateOrderInput) {
    return this.orderRepository.update(id, input);
  }
}

export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string) {
    const existing = await this.orderRepository.findById(id);
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    await this.orderRepository.delete(id);
  }
}

export class GetOrderStatsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  execute() {
    return this.orderRepository.getStats();
  }
}

export class GetDashboardStatsUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: import('../../domain/repositories/ProductRepository').ProductRepository,
    private readonly userRepository: import('../../domain/repositories/UserRepository').UserRepository,
    private readonly tableRepository: import('../../domain/repositories/TableRepository').TableRepository
  ) {}

  async execute() {
    const [orderStats, lowStockCount, activeStaff, occupiedTables, availableCount, reservedCount] =
      await Promise.all([
        this.orderRepository.getStats(),
        this.productRepository.countLowStock(),
        this.userRepository.countActive(),
        this.tableRepository.countByStatus('OCCUPIED'),
        this.tableRepository.countByStatus('AVAILABLE'),
        this.tableRepository.countByStatus('RESERVED'),
      ]);

    const totalTables = occupiedTables + availableCount + reservedCount;
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    return {
      ...orderStats,
      lowStockCount,
      activeStaff,
      occupancyRate,
    };
  }
}
