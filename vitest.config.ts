import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          setupFiles: ['./vitest.setup.ts'],
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          setupFiles: ['./vitest.setup.ts'],
          include: ['tests/integration/**/*.test.ts'],
          pool: 'forks',
          env: { LOG_LEVEL: 'silent' },
        },
      },
    ],
  },
});
