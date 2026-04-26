import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalysisStartedTable1777200020000 implements MigrationInterface {
  name = 'CreateAnalysisStartedTable1777200020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "analysis_started" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_analysis_started" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analysis_started"`);
  }
}
