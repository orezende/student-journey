import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContentDispatchedTable1777200050000 implements MigrationInterface {
  name = 'CreateContentDispatchedTable1777200050000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "content_dispatched" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_content_dispatched" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "content_dispatched"`);
  }
}
