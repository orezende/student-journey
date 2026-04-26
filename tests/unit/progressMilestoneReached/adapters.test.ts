import { describe, it, expect } from 'vitest';
import { fromDbWire, toDbWire } from '../../../src/adapters/progress-milestone-reached';
import { ProgressMilestoneReachedDbWire } from '../../../src/db/wire/progress-milestone-reached';

const eventId = '44444444-4444-4444-4444-444444444444';
const journeyId = '11111111-1111-1111-1111-111111111111';

describe('progressMilestoneReached adapter — fromDbWire', () => {
  it('maps snake_case db columns to camelCase model', () => {
    const wire = new ProgressMilestoneReachedDbWire();
    wire.id = eventId;
    wire.journey_id = journeyId;
    wire.created_at = new Date('2024-01-01');

    expect(fromDbWire(wire)).toEqual({ id: eventId, journeyId, createdAt: new Date('2024-01-01') });
  });
});

describe('progressMilestoneReached adapter — toDbWire', () => {
  it('returns a ProgressMilestoneReachedDbWire instance', () => {
    const result = toDbWire({ id: eventId, journeyId });
    expect(result).toBeInstanceOf(ProgressMilestoneReachedDbWire);
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
