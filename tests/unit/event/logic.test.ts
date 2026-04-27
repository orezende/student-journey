import { describe, it, expect } from '../../../lib/testing';
import { buildEvent } from '../../../src/logic/event';

const journeyId = '11111111-1111-1111-1111-111111111111';
const eventId = '44444444-4444-4444-4444-444444444444';

describe('buildEvent', () => {
  it('maps journeyId and eventId from input', () => {
    const result = buildEvent({ journeyId, eventId });
    expect(result).toEqual({ journeyId, eventId });
  });

  it('does not include extra fields', () => {
    const result = buildEvent({ journeyId, eventId });
    expect(Object.keys(result)).toEqual(['eventId', 'journeyId']);
  });
});
