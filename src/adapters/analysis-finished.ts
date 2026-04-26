import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { AnalysisFinishedDbWire } from '../db/wire/analysis-finished';

export const fromDbWire = fn(AnalysisFinishedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, AnalysisFinishedDbWire, (input) => {
  const row = new AnalysisFinishedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
