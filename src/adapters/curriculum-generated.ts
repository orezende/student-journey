import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { CurriculumGeneratedDbWire } from '../db/wire/curriculum-generated';

export const fromDbWire = fn(CurriculumGeneratedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, CurriculumGeneratedDbWire, (input) => {
  const row = new CurriculumGeneratedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
