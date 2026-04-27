import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateCurriculumGeneratedTable1777200040000 extends Migration {
  name = 'CreateCurriculumGeneratedTable1777200040000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "curriculum_generated" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_curriculum_generated" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "curriculum_generated"`);
  }
}
