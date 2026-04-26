import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { DiagnosticTriggeredDbWire } from '../db/wire/diagnostic-triggered';

export const fromDbWire = fn(DiagnosticTriggeredDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, DiagnosticTriggeredDbWire, (input) => {
  const row = new DiagnosticTriggeredDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
