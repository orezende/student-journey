import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { ContentDispatchedDbWire } from '../db/wire/content-dispatched';

export const fromDbWire = fn(ContentDispatchedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, ContentDispatchedDbWire, (input) => {
  const row = new ContentDispatchedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
