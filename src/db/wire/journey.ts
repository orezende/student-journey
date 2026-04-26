import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('journeys')
export class JourneyDbWire {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id!: string;

  @Column({ name: 'current_step', type: 'varchar' })
  current_step!: string;

  @Column({ type: 'varchar' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  static parse(data: unknown): JourneyDbWire {
    return Object.assign(new JourneyDbWire(), data);
  }
}
