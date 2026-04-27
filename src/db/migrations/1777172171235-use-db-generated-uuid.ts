import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class UseDbGeneratedUuid1777172171235 extends Migration {
  name = 'UseDbGeneratedUuid1777172171235';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(runner, `ALTER TABLE "journey_initiated" RENAME COLUMN "student_id" TO "journey_id"`);
    await sql(runner, `ALTER TABLE "students" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await sql(runner, `ALTER TABLE "journeys" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    await sql(
      runner,
      `ALTER TABLE "journey_initiated" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `ALTER TABLE "journey_initiated" ALTER COLUMN "id" DROP DEFAULT`);
    await sql(runner, `ALTER TABLE "journeys" ALTER COLUMN "id" DROP DEFAULT`);
    await sql(runner, `ALTER TABLE "students" ALTER COLUMN "id" DROP DEFAULT`);
    await sql(runner, `ALTER TABLE "journey_initiated" RENAME COLUMN "journey_id" TO "student_id"`);
  }
}
