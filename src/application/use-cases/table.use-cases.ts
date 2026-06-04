import { TableRepository, TableFilters } from '../../domain/repositories/TableRepository';
import { CreateTableInput, UpdateTableInput } from '../dto/table.dto';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError';

export class ListTablesUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  execute(filters: TableFilters) {
    return this.tableRepository.findAll(filters);
  }
}

export class GetTableUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(id: string) {
    const table = await this.tableRepository.findById(id);
    if (!table) throw new NotFoundError('Mesa no encontrada');
    return table;
  }
}

export class CreateTableUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(input: CreateTableInput) {
    const existing = await this.tableRepository.findByNumber(input.number);
    if (existing) throw new ConflictError('El número de mesa ya existe');
    return this.tableRepository.create(input);
  }
}

export class UpdateTableUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(id: string, input: UpdateTableInput) {
    const existing = await this.tableRepository.findById(id);
    if (!existing) throw new NotFoundError('Mesa no encontrada');

    if (input.number && input.number !== existing.number) {
      const numberTaken = await this.tableRepository.findByNumber(input.number);
      if (numberTaken) throw new ConflictError('El número de mesa ya existe');
    }

    return this.tableRepository.update(id, input);
  }
}

export class DeleteTableUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(id: string) {
    const existing = await this.tableRepository.findById(id);
    if (!existing) throw new NotFoundError('Mesa no encontrada');
    await this.tableRepository.delete(id);
  }
}
