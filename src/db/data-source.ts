import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { StudentDbWire } from './wire/student';
import { JourneyDbWire } from './wire/journey';
import { JourneyInitiatedDbWire } from './wire/journey-initiated';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_journey',
  entities: [StudentDbWire, JourneyDbWire, JourneyInitiatedDbWire],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
