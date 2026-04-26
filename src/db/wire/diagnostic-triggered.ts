import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('diagnostic_triggered')
export class DiagnosticTriggeredDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): DiagnosticTriggeredDbWire {
    return Object.assign(new DiagnosticTriggeredDbWire(), data);
  }
}
