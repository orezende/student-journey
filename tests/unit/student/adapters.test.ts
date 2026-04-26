import { describe, it, expect } from 'vitest';
import { fromDbWire, toDbWire } from '../../../src/adapters/student';
import { StudentDbWire } from '../../../src/db/wire/student';

const studentId = '22222222-2222-2222-2222-222222222222';

describe('student adapter — fromDbWire', () => {
  it('maps snake_case db columns to camelCase model', () => {
    const wire = new StudentDbWire();
    wire.id = studentId;
    wire.name = 'Alice';
    wire.email = 'alice@example.com';
    wire.created_at = new Date('2024-01-01');

    expect(fromDbWire(wire)).toEqual({ id: studentId, name: 'Alice', email: 'alice@example.com', createdAt: new Date('2024-01-01') });
  });
});

describe('student adapter — toDbWire', () => {
  it('returns a StudentDbWire instance', () => {
    const result = toDbWire({ name: 'Alice', email: 'alice@example.com' });
    expect(result).toBeInstanceOf(StudentDbWire);
  });

  it('maps name and email correctly', () => {
    const result = toDbWire({ name: 'Alice', email: 'alice@example.com' });
    expect(result.name).toBe('Alice');
    expect(result.email).toBe('alice@example.com');
  });

  it('does not set id (delegated to DB)', () => {
    const result = toDbWire({ name: 'Alice', email: 'alice@example.com' });
    expect(result.id).toBeUndefined();
  });

  it('does not set created_at (delegated to DB)', () => {
    const result = toDbWire({ name: 'Alice', email: 'alice@example.com' });
    expect(result.created_at).toBeUndefined();
  });
});
