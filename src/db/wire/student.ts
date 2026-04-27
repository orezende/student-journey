import { defineEntity, column, SchemaDefinition } from '../../../lib/db';

export class StudentDbWire {
  id!: string;
  name!: string;
  email!: string;
  created_at!: Date;

  static parse(data: unknown): StudentDbWire {
    return Object.assign(new StudentDbWire(), data);
  }
}

export const StudentSchema: SchemaDefinition<StudentDbWire> = defineEntity(StudentDbWire, {
  tableName: 'students',
  columns: {
    id: column.primaryUuid(),
    name: column.varchar(),
    email: column.varcharUnique(),
    created_at: column.createdAt(),
  },
});
