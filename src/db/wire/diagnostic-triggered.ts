import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class DiagnosticTriggeredDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): DiagnosticTriggeredDbWire {
    return Object.assign(new DiagnosticTriggeredDbWire(), data);
  }
}

export const DiagnosticTriggeredSchema: SchemaDefinition<DiagnosticTriggeredDbWire> = defineEntity(
  DiagnosticTriggeredDbWire,
  {
    tableName: 'diagnostic_triggered',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
