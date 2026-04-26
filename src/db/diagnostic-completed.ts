import { asyncFn } from '../../lib/types/fn';
import { type UUID } from '../../lib/types/uuid';
import { AppDataSource } from './data-source';
import { DiagnosticCompletedDbWire } from './wire/diagnostic-completed';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { fromDbWire, toDbWire } from '../adapters/diagnostic-completed';

const repo = () => AppDataSource.getRepository(DiagnosticCompletedDbWire);

export const insert = asyncFn(EventRecordInput, EventRecord, async (input) => {
  const row = await repo().save(toDbWire(input));
  return fromDbWire(row);
});

export async function findById(id: UUID): Promise<ReturnType<typeof EventRecord.parse> | null> {
  const row = await repo().findOne({ where: { id } });
  return row ? fromDbWire(row) : null;
}
