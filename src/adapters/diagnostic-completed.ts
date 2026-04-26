import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { DiagnosticCompletedDbWire } from '../db/wire/diagnostic-completed';

export const fromDbWire = fn(DiagnosticCompletedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, DiagnosticCompletedDbWire, (input) => {
  const row = new DiagnosticCompletedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
