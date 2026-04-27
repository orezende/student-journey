import { asyncFn } from '../../lib/types/fn';
import { type UUID } from '../../lib/types/uuid';
import { AppDataSource } from './data-source';
import { AnalysisStartedDbWire } from './wire/analysis-started';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { fromDbWire, toDbWire } from '../adapters/analysis-started';

const repo = () => AppDataSource.getRepository(AnalysisStartedDbWire);

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
