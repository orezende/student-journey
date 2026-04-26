import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('progress_milestone_reached')
export class ProgressMilestoneReachedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): ProgressMilestoneReachedDbWire {
    return Object.assign(new ProgressMilestoneReachedDbWire(), data);
  }
}
