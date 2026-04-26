import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { StudentEngagementReceivedDbWire } from '../db/wire/student-engagement-received';

export const fromDbWire = fn(StudentEngagementReceivedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, StudentEngagementReceivedDbWire, (input) => {
  const row = new StudentEngagementReceivedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
