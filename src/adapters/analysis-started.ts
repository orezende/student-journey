import { fn } from '../../lib/types/fn';
import { asUUID } from '../../lib/types/uuid';
import { EventRecord, EventRecordInput } from '../model/event-record';
import { AnalysisStartedDbWire } from '../db/wire/analysis-started';

export const fromDbWire = fn(AnalysisStartedDbWire, EventRecord, (wire) => ({
  id: asUUID(wire.id),
  journeyId: asUUID(wire.journey_id),
  createdAt: wire.created_at,
}));

export const toDbWire = fn(EventRecordInput, AnalysisStartedDbWire, (input) => {
  const row = new AnalysisStartedDbWire();
  row.id = input.id;
  row.journey_id = input.journeyId;
  return row;
});
