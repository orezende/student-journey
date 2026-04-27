import { describe, it, expect } from '../../../lib/testing';
import { fromDbWire, toDbWire } from '../../../src/adapters/analysis-started';
import { AnalysisStartedDbWire } from '../../../src/db/wire/analysis-started';

const eventId = '44444444-4444-4444-4444-444444444444';
const journeyId = '11111111-1111-1111-1111-111111111111';

describe('analysisStarted adapter — fromDbWire', () => {
  it('maps snake_case db columns to camelCase model', () => {
    const wire = new AnalysisStartedDbWire();
    wire.id = eventId;
    wire.journey_id = journeyId;
    wire.created_at = new Date('2024-01-01');

    expect(fromDbWire(wire)).toEqual({ id: eventId, journeyId, createdAt: new Date('2024-01-01') });
  });
});

describe('analysisStarted adapter — toDbWire', () => {
  it('returns an AnalysisStartedDbWire instance', () => {
    const result = toDbWire({ id: eventId, journeyId });
    expect(result).toBeInstanceOf(AnalysisStartedDbWire);
  });

  it('maps id and journeyId to db columns', () => {
    const result = toDbWire({ id: eventId, journeyId });
    expect(result.id).toBe(eventId);
    expect(result.journey_id).toBe(journeyId);
  });

  it('does not set created_at (delegated to DB)', () => {
    const result = toDbWire({ id: eventId, journeyId });
    expect(result.created_at).toBeUndefined();
  });
});
