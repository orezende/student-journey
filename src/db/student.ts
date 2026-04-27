import { asyncFn } from '../../lib/types/fn';
import { AppDataSource } from './data-source';
import { StudentDbWire } from './wire/student';
import { Student, StudentInput } from '../model/student';
import { fromDbWire, toDbWire } from '../adapters/student';

const repo = () => AppDataSource.getRepository(StudentDbWire);

export async function findByEmail(email: string) {
  const row = await repo().findOneBy({ email });
  return row ? fromDbWire(row) : null;
}

export const insert = asyncFn(StudentInput, Student, async (student) => {
  const row = await repo().save(toDbWire(student));
  return fromDbWire(row);
});

export async function findAll(): Promise<ReturnType<typeof Student.parse>[]> {
  const rows = await repo().find();
  return rows.map(fromDbWire);
}
