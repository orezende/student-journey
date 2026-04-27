import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class DiagnosticCompletedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): DiagnosticCompletedDbWire {
    return Object.assign(new DiagnosticCompletedDbWire(), data);
  }
}

export const DiagnosticCompletedSchema: SchemaDefinition<DiagnosticCompletedDbWire> = defineEntity(
  DiagnosticCompletedDbWire,
  {
    tableName: 'diagnostic_completed',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
