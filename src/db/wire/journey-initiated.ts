import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class JourneyInitiatedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): JourneyInitiatedDbWire {
    return Object.assign(new JourneyInitiatedDbWire(), data);
  }
}

export const JourneyInitiatedSchema: SchemaDefinition<JourneyInitiatedDbWire> = defineEntity(
  JourneyInitiatedDbWire,
  {
    tableName: 'journey_initiated',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
