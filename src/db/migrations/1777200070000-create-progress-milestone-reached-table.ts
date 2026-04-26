import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgressMilestoneReachedTable1777200070000 implements MigrationInterface {
  name = 'CreateProgressMilestoneReachedTable1777200070000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "progress_milestone_reached" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_progress_milestone_reached" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "progress_milestone_reached"`);
  }
}
