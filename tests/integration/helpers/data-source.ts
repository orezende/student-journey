import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { StudentDbWire } from '../../../src/db/wire/student';
import { JourneyDbWire } from '../../../src/db/wire/journey';
import { JourneyInitiatedDbWire } from '../../../src/db/wire/journey-initiated';

export const TestDataSource = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  entities: [StudentDbWire, JourneyDbWire, JourneyInitiatedDbWire],
});
