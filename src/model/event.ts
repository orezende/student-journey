import { createSchema, field } from '../../lib/types/schema';

export const Event = createSchema({
  eventId: field.uuid(),
  journeyId: field.uuid(),
});
