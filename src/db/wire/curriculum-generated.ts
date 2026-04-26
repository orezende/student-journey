import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('curriculum_generated')
export class CurriculumGeneratedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): CurriculumGeneratedDbWire {
    return Object.assign(new CurriculumGeneratedDbWire(), data);
  }
}
