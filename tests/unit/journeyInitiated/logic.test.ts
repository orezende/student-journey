import { describe, it, expect } from '../../../lib/testing';
import { buildJourneyInitiated } from '../../../src/logic/journey-initiated';

const journeyId = '11111111-1111-1111-1111-111111111111';
const studentId = '22222222-2222-2222-2222-222222222222';

const journey = {
  id: journeyId,
  studentId,
  currentStep: 'JOURNEY_INITIATED' as const,
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
};

describe('buildJourneyInitiated', () => {
  it('maps journey id to journeyId', () => {
    const result = buildJourneyInitiated(journey);
    expect(result).toEqual({ journeyId });
  });

  it('does not include extra fields', () => {
    const result = buildJourneyInitiated(journey);
    expect(Object.keys(result)).toEqual(['journeyId']);
  });
});
