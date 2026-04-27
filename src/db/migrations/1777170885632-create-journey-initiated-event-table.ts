import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateJourneyInitiatedEventTable1777170885632 extends Migration {
  name = 'CreateJourneyInitiatedEventTable1777170885632';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `CREATE TABLE "journey_initiated" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4f2cab7867045cb456048d065fa" PRIMARY KEY ("id"))`,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "journey_initiated"`);
  }
}
