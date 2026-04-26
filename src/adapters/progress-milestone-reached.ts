import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { ProgressMilestoneReachedDbWire } from '../db/wire/progress-milestone-reached';

export const fromDbWire = fn(ProgressMilestoneReachedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, ProgressMilestoneReachedDbWire, (input) => {
  const row = new ProgressMilestoneReachedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
