import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('diagnostic_completed')
export class DiagnosticCompletedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): DiagnosticCompletedDbWire {
    return Object.assign(new DiagnosticCompletedDbWire(), data);
  }
}
