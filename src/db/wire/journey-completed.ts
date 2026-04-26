import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('journey_completed')
export class JourneyCompletedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): JourneyCompletedDbWire {
    return Object.assign(new JourneyCompletedDbWire(), data);
  }
}
