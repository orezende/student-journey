import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDiagnosticTriggeredTable1777200000000 implements MigrationInterface {
  name = 'CreateDiagnosticTriggeredTable1777200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "diagnostic_triggered" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_diagnostic_triggered" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "diagnostic_triggered"`);
  }
}
