import { asyncFn } from '../../lib/types/fn';
import { AppDataSource } from './data-source';
import { JourneyDbWire } from './wire/journey';
import { Journey, JourneyRecord } from '../model/journey';
import { fromDbWire, toDbWire } from '../adapters/journey';

const repo = () => AppDataSource.getRepository(JourneyDbWire);

export const insert = asyncFn(JourneyRecord, Journey, async (record) => {
  const row = await repo().save(toDbWire(record));
  return fromDbWire(row);
});
