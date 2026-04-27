import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateJourneyEntity1777168776838 extends Migration {
  name = 'CreateJourneyEntity1777168776838';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `CREATE TABLE "students" ("id" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_25985d58c714a4a427ced57507b" UNIQUE ("email"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`,
    );
    await sql(
      runner,
      `CREATE TABLE "journeys" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "current_step" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_94b31b067846c92b6811046c81e" PRIMARY KEY ("id"))`,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "journeys"`);
    await sql(runner, `DROP TABLE "students"`);
  }
}
