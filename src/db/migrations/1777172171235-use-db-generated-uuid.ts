import { MigrationInterface, QueryRunner } from "typeorm";

export class UseDbGeneratedUuid1777172171235 implements MigrationInterface {
    name = 'UseDbGeneratedUuid1777172171235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journey_initiated" RENAME COLUMN "student_id" TO "journey_id"`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "journeys" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "journey_initiated" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journey_initiated" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "journeys" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "journey_initiated" RENAME COLUMN "journey_id" TO "student_id"`);
    }

}
