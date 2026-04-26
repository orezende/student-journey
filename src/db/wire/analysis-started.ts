import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('analysis_started')
export class AnalysisStartedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): AnalysisStartedDbWire {
    return Object.assign(new AnalysisStartedDbWire(), data);
  }
}
