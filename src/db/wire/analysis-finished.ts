import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class AnalysisFinishedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): AnalysisFinishedDbWire {
    return Object.assign(new AnalysisFinishedDbWire(), data);
  }
}

export const AnalysisFinishedSchema: SchemaDefinition<AnalysisFinishedDbWire> = defineEntity(
  AnalysisFinishedDbWire,
  {
    tableName: 'analysis_finished',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
