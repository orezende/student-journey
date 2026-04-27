import { asyncFn } from '../../lib/types/fn';
import { AppDataSource } from './data-source';
import { JourneyDbWire } from './wire/journey';
import { Journey, JourneyRecord, JourneyStepUpdate, JourneyStatusUpdate } from '../model/journey';
import { fromDbWire, toDbWire } from '../adapters/journey';

const repo = () => AppDataSource.getRepository(JourneyDbWire);

export const insert = asyncFn(JourneyRecord, Journey, async (record) => {
  const row = await repo().save(toDbWire(record));
  return fromDbWire(row);
});

export const updateStep = asyncFn(JourneyStepUpdate, async (input) => {
  await repo().update({ id: input.id }, { current_step: input.currentStep });
});

export const updateStatus = asyncFn(JourneyStatusUpdate, async (input) => {
  await repo().update({ id: input.id }, { status: input.status });
});

export async function findAll(): Promise<ReturnType<typeof Journey.parse>[]> {
  const rows = await repo().find();
  return rows.map(fromDbWire);
}
