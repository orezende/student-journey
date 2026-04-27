import { vi } from 'vitest';

export { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
export { createTestDataSource } from '../db';

export const test = {
  fn: vi.fn,
  mock: vi.mock,
  spy: vi.spyOn,
  clearAll: vi.clearAllMocks,
};
