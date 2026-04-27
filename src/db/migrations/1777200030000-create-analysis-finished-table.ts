import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateAnalysisFinishedTable1777200030000 extends Migration {
  name = 'CreateAnalysisFinishedTable1777200030000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "analysis_finished" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analysis_finished" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "analysis_finished"`);
  }
}
