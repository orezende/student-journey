import { fn } from '../../lib/types/fn';
import {
  JourneyInput,
  JourneyRecord,
  JourneyStepUpdate,
  JourneyStatusUpdate,
} from '../model/journey';

export const buildJourney = fn(JourneyInput, JourneyRecord, (input) => ({
  studentId: input.studentId,
  currentStep: 'JOURNEY_INITIATED' as const,
  status: 'active' as const,
}));

export const buildJourneyStepUpdate = fn(JourneyStepUpdate, JourneyStepUpdate, (input) => input);

export const buildJourneyStatusUpdate = fn(
  JourneyStatusUpdate,
  JourneyStatusUpdate,
  (input) => input,
);
