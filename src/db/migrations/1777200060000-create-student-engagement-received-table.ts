import { Migration, sql, MigrationRunner } from '../../../lib/db';

export class CreateStudentEngagementReceivedTable1777200060000 extends Migration {
  name = 'CreateStudentEngagementReceivedTable1777200060000';

  async up(runner: MigrationRunner): Promise<void> {
    await sql(
      runner,
      `
      CREATE TABLE "student_engagement_received" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_engagement_received" PRIMARY KEY ("id")
      )
    `,
    );
  }

  async down(runner: MigrationRunner): Promise<void> {
    await sql(runner, `DROP TABLE "student_engagement_received"`);
  }
}
