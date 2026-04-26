import { fn } from '../../lib/types/fn';
import { JourneyInput, JourneyRecord } from '../model/journey';

export const buildJourney = fn(
  JourneyInput,
  JourneyRecord,
  (input) => ({
    studentId: input.studentId,
    currentStep: 'JOURNEY_INITIATED' as const,
    status: 'active' as const,
  }),
);
