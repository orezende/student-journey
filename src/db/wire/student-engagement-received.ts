import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class StudentEngagementReceivedDbWire {
  id!: string;
  journey_id!: string;
  created_at!: Date;

  static parse(data: unknown): StudentEngagementReceivedDbWire {
    return Object.assign(new StudentEngagementReceivedDbWire(), data);
  }
}

export const StudentEngagementReceivedSchema: SchemaDefinition<StudentEngagementReceivedDbWire> =
  defineEntity(StudentEngagementReceivedDbWire, {
    tableName: 'student_engagement_received',
    columns: {
      id: column.primaryUuid(),
      journey_id: column.uuid(),
      created_at: column.createdAt(),
    },
  });
