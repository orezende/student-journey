import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class ProgressMilestoneReachedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): ProgressMilestoneReachedDbWire {
    return Object.assign(new ProgressMilestoneReachedDbWire(), data);
  }
}

export const ProgressMilestoneReachedSchema: SchemaDefinition<ProgressMilestoneReachedDbWire> =
  defineEntity(ProgressMilestoneReachedDbWire, {
    tableName: 'progress_milestone_reached',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  });
