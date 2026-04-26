import { asyncFn } from '../../lib/types/fn';
import { AppDataSource } from './data-source';
import { JourneyInitiatedDbWire } from './wire/journey-initiated';
import { JourneyInitiated, JourneyInitiatedInput } from '../model/journey-initiated';
import { fromDbWire, toDbWire } from '../adapters/journey-initiated';

const repo = () => AppDataSource.getRepository(JourneyInitiatedDbWire);

export const insert = asyncFn(JourneyInitiatedInput, JourneyInitiated, async (input) => {
  const row = await repo().save(toDbWire(input));
  return fromDbWire(row);
});
