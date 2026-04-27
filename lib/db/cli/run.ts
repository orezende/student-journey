import { execSync } from 'node:child_process';

try {
  execSync(
    'tsx ./node_modules/typeorm/cli.js migration:run -d src/db/data-source.ts',
    { stdio: 'inherit' },
  );
} catch {
  process.exit(1);
}
