import { copyFileSync, chmodSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const hooks = ['pre-commit', 'pre-push'];
const hooksSourceDir = join(__dirname, 'hooks');
const gitHooksDir = join(process.cwd(), '.git', 'hooks');

if (!existsSync(gitHooksDir)) {
  console.error('Error: .git/hooks not found. Run this from the repository root.');
  process.exit(1);
}

for (const hook of hooks) {
  const src = join(hooksSourceDir, hook);
  const dest = join(gitHooksDir, hook);
  copyFileSync(src, dest);
  chmodSync(dest, 0o755);
  console.log(`Installed ${hook}`);
}

console.log('\nQuality hooks installed.');
