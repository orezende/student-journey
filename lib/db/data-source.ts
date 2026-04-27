import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { extractEntitySchema, SchemaDefinition } from './entity';

export interface DataSourceOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: SchemaDefinition<unknown>[];
  migrationsDir: string;
}

export function createDataSource(options: DataSourceOptions): DataSource {
  return new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    database: options.database,
    entities: options.entities.map(extractEntitySchema),
    migrations: [join(options.migrationsDir, '*.{ts,js}')],
    synchronize: false,
  });
}

export function createTestDataSource(schemas: SchemaDefinition<unknown>[]): DataSource {
  return new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    entities: schemas.map(extractEntitySchema),
  });
}
