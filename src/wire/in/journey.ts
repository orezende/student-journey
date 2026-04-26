import { createSchema, field } from '../../../lib/types/schema';

export const StartJourneyWireIn = createSchema({
  name: field.string(),
  email: field.string(),
});
