import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class AnalysisStartedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): AnalysisStartedDbWire {
    return Object.assign(new AnalysisStartedDbWire(), data);
  }
}

export const AnalysisStartedSchema: SchemaDefinition<AnalysisStartedDbWire> = defineEntity(
  AnalysisStartedDbWire,
  {
    tableName: 'analysis_started',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
