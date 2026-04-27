import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateDiagnosticTriggeredTable1777200000000 extends Migration {
  name = 'CreateDiagnosticTriggeredTable1777200000000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "diagnostic_triggered" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_diagnostic_triggered" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "diagnostic_triggered"`);
  }
}
