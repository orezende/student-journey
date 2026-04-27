import { describe, it, expect } from '../../../lib/testing';
import { buildStudent } from '../../../src/logic/student';

describe('buildStudent', () => {
  it('returns name and email from input', () => {
    const result = buildStudent({ name: 'Alice', email: 'alice@example.com' });
    expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' });
  });

  it('does not generate id', () => {
    const result = buildStudent({ name: 'Alice', email: 'alice@example.com' });
    expect((result as Record<string, unknown>).id).toBeUndefined();
  });

  it('does not set createdAt', () => {
    const result = buildStudent({ name: 'Alice', email: 'alice@example.com' });
    expect((result as Record<string, unknown>).createdAt).toBeUndefined();
  });
});
