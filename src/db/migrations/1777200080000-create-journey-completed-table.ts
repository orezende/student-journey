import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJourneyCompletedTable1777200080000 implements MigrationInterface {
  name = 'CreateJourneyCompletedTable1777200080000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "journey_completed" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_journey_completed" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "journey_completed"`);
  }
}
