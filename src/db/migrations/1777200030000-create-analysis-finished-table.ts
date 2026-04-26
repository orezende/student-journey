import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalysisFinishedTable1777200030000 implements MigrationInterface {
  name = 'CreateAnalysisFinishedTable1777200030000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "analysis_finished" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analysis_finished" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analysis_finished"`);
  }
}
