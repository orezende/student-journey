import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDiagnosticCompletedTable1777200010000 implements MigrationInterface {
  name = 'CreateDiagnosticCompletedTable1777200010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "diagnostic_completed" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_diagnostic_completed" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "diagnostic_completed"`);
  }
}
