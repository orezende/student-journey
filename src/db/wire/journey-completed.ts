import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class JourneyCompletedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): JourneyCompletedDbWire {
    return Object.assign(new JourneyCompletedDbWire(), data);
  }
}

export const JourneyCompletedSchema: SchemaDefinition<JourneyCompletedDbWire> = defineEntity(
  JourneyCompletedDbWire,
  {
    tableName: 'journey_completed',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
