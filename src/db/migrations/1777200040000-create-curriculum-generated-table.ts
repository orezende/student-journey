import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCurriculumGeneratedTable1777200040000 implements MigrationInterface {
  name = 'CreateCurriculumGeneratedTable1777200040000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "curriculum_generated" (
        "id" uuid NOT NULL,
        "journey_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_curriculum_generated" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "curriculum_generated"`);
  }
}
