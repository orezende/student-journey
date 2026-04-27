import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateProgressMilestoneReachedTable1777200070000 extends Migration {
  name = 'CreateProgressMilestoneReachedTable1777200070000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "progress_milestone_reached" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_progress_milestone_reached" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "progress_milestone_reached"`);
  }
}
