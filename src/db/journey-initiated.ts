import { asyncFn } from '../../lib/types/fn';
import { AppDataSource } from './data-source';
import { JourneyInitiatedDbWire } from './wire/journey-initiated';
import { JourneyInitiated, JourneyInitiatedInput } from '../model/journey-initiated';
import { fromDbWire, toDbWire } from '../adapters/journey-initiated';
import { type UUID } from '../../lib/types/uuid';

const repo = () => AppDataSource.getRepository(JourneyInitiatedDbWire);

export const insert = asyncFn(JourneyInitiatedInput, JourneyInitiated, async (input) => {
  const row = await repo().save(toDbWire(input));
  return fromDbWire(row);
});

export async function findById(id: UUID): Promise<ReturnType<typeof JourneyInitiated.parse> | null> {
  const row = await repo().findOne({ where: { id } });
  return row ? fromDbWire(row) : null;
}
