import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateAnalysisStartedTable1777200020000 extends Migration {
  name = 'CreateAnalysisStartedTable1777200020000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "analysis_started" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analysis_started" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "analysis_started"`);
  }
}
