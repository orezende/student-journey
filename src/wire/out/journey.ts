import { createSchema, field } from '../../../lib/types/schema';
import { JOURNEY_STEPS, JOURNEY_STATUSES } from '../../model/journey';

export const JourneyWireOut = createSchema({
  id: field.uuid(),
  studentId: field.uuid(),
  currentStep: field.literal(...JOURNEY_STEPS),
  status: field.literal(...JOURNEY_STATUSES),
  createdAt: field.string(),
});
