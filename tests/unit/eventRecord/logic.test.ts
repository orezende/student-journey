import { describe, it, expect } from 'vitest';
import { buildEventRecord } from '../../../src/logic/event-record';

const journeyId = '11111111-1111-1111-1111-111111111111';
const eventId = '44444444-4444-4444-4444-444444444444';

describe('buildEventRecord', () => {
  it('maps eventId to id', () => {
    const result = buildEventRecord({ journeyId, eventId });
    expect(result.id).toBe(eventId);
  });

  it('maps journeyId', () => {
    const result = buildEventRecord({ journeyId, eventId });
    expect(result.journeyId).toBe(journeyId);
  });

  it('does not include extra fields', () => {
    const result = buildEventRecord({ journeyId, eventId });
    expect(Object.keys(result)).toEqual(['id', 'journeyId']);
  });
});
