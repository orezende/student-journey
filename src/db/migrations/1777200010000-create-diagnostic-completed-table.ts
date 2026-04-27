import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateDiagnosticCompletedTable1777200010000 extends Migration {
  name = 'CreateDiagnosticCompletedTable1777200010000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "diagnostic_completed" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_diagnostic_completed" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "diagnostic_completed"`);
  }
}
