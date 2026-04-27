import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class JourneyDbWire {
  id!: string;
  student_id!: string;
  current_step!: string;
  status!: string;
  created_at!: Date;

  static parse(data: unknown): JourneyDbWire {
    return Object.assign(new JourneyDbWire(), data);
  }
}

export const JourneySchema: SchemaDefinition<JourneyDbWire> = defineEntity(JourneyDbWire, {
  tableName: 'journeys',
  columns: {
    id: column.primaryUuid(),
    student_id: column.uuid(),
    current_step: column.varchar(),
    status: column.varchar(),
    created_at: column.createdAt(),
  },
});
