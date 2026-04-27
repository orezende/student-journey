import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class ContentDispatchedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): ContentDispatchedDbWire {
    return Object.assign(new ContentDispatchedDbWire(), data);
  }
}

export const ContentDispatchedSchema: SchemaDefinition<ContentDispatchedDbWire> = defineEntity(
  ContentDispatchedDbWire,
  {
    tableName: 'content_dispatched',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
