import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

const outputPath = process.argv[2];

if (!outputPath) {
  console.error('Usage: tsx lib/db/cli/generate.ts <output-path>');
  console.error('Example: tsx lib/db/cli/generate.ts src/db/migrations/AddUserEmail');
  process.exit(1);
}

const dataSourcePath = 'src/db/data-source.ts';
const libDbPath = resolve(process.cwd(), 'lib/db/index.ts');

// Run TypeORM CLI generator
try {
  execSync(
    `tsx ./node_modules/typeorm/cli.js migration:generate -d ${dataSourcePath} ${outputPath}`,
    { stdio: 'inherit' },
  );
} catch {
  process.exit(1);
}

// Find the generated file (TypeORM appends a timestamp to the name)
const dir = resolve(process.cwd(), dirname(outputPath));
const baseName = outputPath.split('/').pop()!;
const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && f.includes(baseName));

if (files.length === 0) {
  console.error(`Could not find generated migration file in ${dir}`);
  process.exit(1);
}

const generatedFile = resolve(dir, files[files.length - 1]);
const libImportPath = relative(dirname(generatedFile), dirname(libDbPath));

let content = readFileSync(generatedFile, 'utf-8');

// Replace TypeORM import with lib/db import
content = content.replace(
  /import\s*\{\s*MigrationInterface\s*,\s*QueryRunner\s*\}\s*from\s*['"]typeorm['"];?/,
  `import { Migration, sql, MigrationRunner } from '${libImportPath}';`,
);

// Replace implements MigrationInterface with extends Migration
content = content.replace(/implements MigrationInterface/, 'extends Migration');

// Replace method signatures
content = content.replace(/async up\(queryRunner: QueryRunner\)/g, 'async up(runner: MigrationRunner)');
content = content.replace(/async down\(queryRunner: QueryRunner\)/g, 'async down(runner: MigrationRunner)');

// Replace queryRunner.query( with sql(runner,
content = content.replace(/await queryRunner\.query\(/g, 'await sql(runner, ');

writeFileSync(generatedFile, content, 'utf-8');

console.log(`\nMigration generated and transformed: ${generatedFile}`);
