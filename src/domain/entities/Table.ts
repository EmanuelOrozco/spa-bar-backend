import { TableStatus } from '../../shared/types';

export interface TableProps {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: TableStatus;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Table {
  readonly id: string;
  readonly number: string;
  readonly name: string;
  readonly capacity: number;
  readonly status: TableStatus;
  readonly location: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: TableProps) {
    Object.assign(this, props);
  }
}
