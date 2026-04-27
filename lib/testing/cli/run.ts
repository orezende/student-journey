import { execSync } from 'node:child_process';

const project = process.argv[2];
const cmd = project ? `vitest run --project ${project}` : 'vitest run';

try {
  execSync(cmd, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
