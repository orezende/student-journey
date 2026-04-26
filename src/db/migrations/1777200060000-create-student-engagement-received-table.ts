import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentEngagementReceivedTable1777200060000 implements MigrationInterface {
  name = 'CreateStudentEngagementReceivedTable1777200060000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "student_engagement_received" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_engagement_received" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "student_engagement_received"`);
  }
}
