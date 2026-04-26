import { describe, it, expect } from 'vitest';
import { buildJourney } from '../../../src/logic/journey';

const studentId = '22222222-2222-2222-2222-222222222222';

describe('buildJourney', () => {
  it('sets studentId from input', () => {
    const result = buildJourney({ studentId });
    expect(result.studentId).toBe(studentId);
  });

  it('sets currentStep to JOURNEY_INITIATED', () => {
    const result = buildJourney({ studentId });
    expect(result.currentStep).toBe('JOURNEY_INITIATED');
  });

  it('sets status to active', () => {
    const result = buildJourney({ studentId });
    expect(result.status).toBe('active');
  });

  it('does not generate id', () => {
    const result = buildJourney({ studentId });
    expect((result as Record<string, unknown>).id).toBeUndefined();
  });

  it('does not set createdAt', () => {
    const result = buildJourney({ studentId });
    expect((result as Record<string, unknown>).createdAt).toBeUndefined();
  });
});
