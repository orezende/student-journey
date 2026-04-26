import { createSchema, field } from '../../lib/types/schema';

export const EventRecord = createSchema({
  id: field.uuid(),
  journeyId: field.uuid(),
  createdAt: field.date(),
});

export const EventRecordInput = createSchema({
  id: field.uuid(),
  journeyId: field.uuid(),
});
