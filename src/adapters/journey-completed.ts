import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { JourneyCompletedDbWire } from '../db/wire/journey-completed';

export const fromDbWire = fn(JourneyCompletedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, JourneyCompletedDbWire, (input) => {
  const row = new JourneyCompletedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
