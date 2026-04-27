import { describe, it, expect } from '../../../lib/testing';
import { buildJourney, buildJourneyStepUpdate, buildJourneyStatusUpdate } from '../../../src/logic/journey';

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

const journeyId = '11111111-1111-1111-1111-111111111111';

describe('buildJourneyStepUpdate', () => {
  it('passes id and currentStep through unchanged', () => {
    const result = buildJourneyStepUpdate({ id: journeyId, currentStep: 'DIAGNOSTIC_TRIGGERED' });
    expect(result).toEqual({ id: journeyId, currentStep: 'DIAGNOSTIC_TRIGGERED' });
  });

  it('does not include extra fields', () => {
    const result = buildJourneyStepUpdate({ id: journeyId, currentStep: 'ANALYSIS_STARTED' });
    expect(Object.keys(result)).toEqual(['id', 'currentStep']);
  });
});

describe('buildJourneyStatusUpdate', () => {
  it('passes id and status through unchanged', () => {
    const result = buildJourneyStatusUpdate({ id: journeyId, status: 'completed' });
    expect(result).toEqual({ id: journeyId, status: 'completed' });
  });

  it('does not include extra fields', () => {
    const result = buildJourneyStatusUpdate({ id: journeyId, status: 'completed' });
    expect(Object.keys(result)).toEqual(['id', 'status']);
  });
});
