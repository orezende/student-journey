import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJourneyInitiatedEventTable1777170885632 implements MigrationInterface {
    name = 'CreateJourneyInitiatedEventTable1777170885632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "journey_initiated" ("id" uuid NOT NULL, "student_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4f2cab7867045cb456048d065fa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "journey_initiated"`);
    }

}
