import { createSchema, field } from '../../../lib/types/schema';

export const EventWireIn = createSchema({
  eventId: field.string(),
  journeyId: field.string(),
});
