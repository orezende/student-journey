import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateContentDispatchedTable1777200050000 extends Migration {
  name = 'CreateContentDispatchedTable1777200050000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "content_dispatched" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_content_dispatched" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "content_dispatched"`);
  }
}
