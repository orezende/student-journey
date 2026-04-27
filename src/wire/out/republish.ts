import { createSchema, field } from '../../../lib/types/schema';

export const RepublishWireOut = createSchema({
  republished: field.number(),
});
