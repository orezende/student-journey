import 'reflect-metadata';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { StudentDbWire } from './wire/student';
import { JourneyDbWire } from './wire/journey';
import { JourneyInitiatedDbWire } from './wire/journey-initiated';
import { DiagnosticTriggeredDbWire } from './wire/diagnostic-triggered';
import { DiagnosticCompletedDbWire } from './wire/diagnostic-completed';
import { AnalysisStartedDbWire } from './wire/analysis-started';
import { AnalysisFinishedDbWire } from './wire/analysis-finished';
import { CurriculumGeneratedDbWire } from './wire/curriculum-generated';
import { ContentDispatchedDbWire } from './wire/content-dispatched';
import { StudentEngagementReceivedDbWire } from './wire/student-engagement-received';
import { ProgressMilestoneReachedDbWire } from './wire/progress-milestone-reached';
import { JourneyCompletedDbWire } from './wire/journey-completed';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_journey',
  entities: [
    StudentDbWire,
    JourneyDbWire,
    JourneyInitiatedDbWire,
    DiagnosticTriggeredDbWire,
    DiagnosticCompletedDbWire,
    AnalysisStartedDbWire,
    AnalysisFinishedDbWire,
    CurriculumGeneratedDbWire,
    ContentDispatchedDbWire,
    StudentEngagementReceivedDbWire,
    ProgressMilestoneReachedDbWire,
    JourneyCompletedDbWire,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
});
