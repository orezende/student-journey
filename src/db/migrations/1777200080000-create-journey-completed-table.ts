import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateJourneyCompletedTable1777200080000 extends Migration {
  name = 'CreateJourneyCompletedTable1777200080000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "journey_completed" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_journey_completed" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "journey_completed"`);
  }
}
