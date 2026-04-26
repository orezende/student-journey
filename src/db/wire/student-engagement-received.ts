import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('student_engagement_received')
export class StudentEngagementReceivedDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'journey_id', type: 'uuid' })
  journey_id!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): StudentEngagementReceivedDbWire {
    return Object.assign(new StudentEngagementReceivedDbWire(), data);
  }
}
