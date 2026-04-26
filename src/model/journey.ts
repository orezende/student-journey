import { createSchema, field } from '../../lib/types/schema';

export const JOURNEY_STEPS = [
  'JOURNEY_INITIATED',
  'DIAGNOSTIC_TRIGGERED',
  'DIAGNOSTIC_COMPLETED',
  'ANALYSIS_STARTED',
  'ANALYSIS_FINISHED',
  'CURRICULUM_GENERATED',
  'CONTENT_DISPATCHED',
  'STUDENT_ENGAGEMENT_RECEIVED',
  'PROGRESS_MILESTONE_REACHED',
  'JOURNEY_COMPLETED',
] as const;

export const JOURNEY_STATUSES = ['active', 'completed', 'failed'] as const;

export type JourneyStep = (typeof JOURNEY_STEPS)[number];
export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];

export const Journey = createSchema({
  id: field.uuid(),
  studentId: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
  status: field.literal(...JOURNEY_STATUSES),
  createdAt: field.date(),
});

export const JourneyInput = createSchema({
  studentId: field.uuid(),
});

export const JourneyRecord = createSchema({
  studentId: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
  status: field.literal(...JOURNEY_STATUSES),
});

export const JourneyStepUpdate = createSchema({
  id: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
});

export const JourneyStatusUpdate = createSchema({
  id: field.uuid(),
  status: field.literal(...JOURNEY_STATUSES),
});
