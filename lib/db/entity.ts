import { EntitySchema } from 'typeorm';
import type { ColumnDef } from './types';

export class SchemaDefinition<T> {
  /** @internal */
  readonly _entitySchema: EntitySchema<T>;

  constructor(schema: EntitySchema<T>) {
    this._entitySchema = schema;
  }
}

export function extractEntitySchema<T>(def: SchemaDefinition<T>): EntitySchema<T> {
  return def._entitySchema;
}

export function defineEntity<T extends object>(
  target: new () => T,
  options: { tableName: string; columns: Partial<Record<keyof T, ColumnDef>> },
): SchemaDefinition<T> {
  const schema = new EntitySchema<T>({
    name: target.name,
    target,
    tableName: options.tableName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: options.columns as any,
  });
  return new SchemaDefinition(schema);
}

export const column = {
  primaryUuid(): ColumnDef {
    return { type: 'uuid', primary: true, generated: 'uuid' };
  },
  uuid(): ColumnDef {
    return { type: 'uuid' };
  },
  varchar(): ColumnDef {
    return { type: 'varchar' };
  },
  varcharUnique(): ColumnDef {
    return { type: 'varchar', unique: true };
  },
  createdAt(): ColumnDef {
    return { createDate: true };
  },
};
