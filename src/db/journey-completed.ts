import { asyncFn } from '../../lib/types/fn';
import { type UUID } from '../../lib/types/uuid';
import { AppDataSource } from './data-source';
import { JourneyCompletedDbWire } from './wire/journey-completed';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { fromDbWire, toDbWire } from '../adapters/journey-completed';

const repo = () => AppDataSource.getRepository(JourneyCompletedDbWire);

export const insert = asyncFn(EventRecordInput, EventRecord, async (input) => {
  const row = await repo().save(toDbWire(input));
  return fromDbWire(row);
});

export async function findById(id: UUID): Promise<ReturnType<typeof EventRecord.parse> | null> {
  const row = await repo().findOne({ where: { id } });
  return row ? fromDbWire(row) : null;
}

export async function findAll(): Promise<ReturnType<typeof EventRecord.parse>[]> {
  const rows = await repo().find();
  return rows.map(fromDbWire);
}
