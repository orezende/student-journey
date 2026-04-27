import { execSync } from 'node:child_process';

try {
  execSync(
    'tsx ./node_modules/typeorm/cli.js migration:revert -d src/db/data-source.ts',
    { stdio: 'inherit' },
  );
} catch {
  process.exit(1);
}
