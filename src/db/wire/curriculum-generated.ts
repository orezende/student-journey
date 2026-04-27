import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class CurriculumGeneratedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): CurriculumGeneratedDbWire {
    return Object.assign(new CurriculumGeneratedDbWire(), data);
  }
}

export const CurriculumGeneratedSchema: SchemaDefinition<CurriculumGeneratedDbWire> = defineEntity(
  CurriculumGeneratedDbWire,
  {
    tableName: 'curriculum_generated',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  },
);
