import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { StudentDbWire } from '../../../src/db/wire/student';
import { JourneyDbWire } from '../../../src/db/wire/journey';
import { JourneyInitiatedDbWire } from '../../../src/db/wire/journey-initiated';
import { DiagnosticTriggeredDbWire } from '../../../src/db/wire/diagnostic-triggered';
import { DiagnosticCompletedDbWire } from '../../../src/db/wire/diagnostic-completed';
import { AnalysisStartedDbWire } from '../../../src/db/wire/analysis-started';
import { AnalysisFinishedDbWire } from '../../../src/db/wire/analysis-finished';
import { CurriculumGeneratedDbWire } from '../../../src/db/wire/curriculum-generated';
import { ContentDispatchedDbWire } from '../../../src/db/wire/content-dispatched';
import { StudentEngagementReceivedDbWire } from '../../../src/db/wire/student-engagement-received';
import { ProgressMilestoneReachedDbWire } from '../../../src/db/wire/progress-milestone-reached';
import { JourneyCompletedDbWire } from '../../../src/db/wire/journey-completed';

export const TestDataSource = new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
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
});
