import { describe, it, expect } from '../../../lib/testing';
import { toModel } from '../../../src/adapters/event';

const journeyId = '11111111-1111-1111-1111-111111111111';
const eventId = '44444444-4444-4444-4444-444444444444';

describe('event adapter — toModel', () => {
  it('maps wire string fields to domain UUID fields', () => {
    const result = toModel({ eventId, journeyId });
    expect(result).toEqual({ eventId, journeyId });
  });

  it('rejects invalid eventId', () => {
    expect(() => toModel({ eventId: 'not-a-uuid', journeyId })).toThrow();
  });

  it('rejects invalid journeyId', () => {
    expect(() => toModel({ eventId, journeyId: 'not-a-uuid' })).toThrow();
  });
});
