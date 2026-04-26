import { createSchema, field } from '../../lib/types/schema';

export const Student = createSchema({
  id: field.uuid(),
  name: field.string(),
  email: field.string(),
  createdAt: field.date(),
});

export const StudentInput = createSchema({
  name: field.string(),
  email: field.string(),
});
