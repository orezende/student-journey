import { createTestDataSource } from '../../../lib/testing';
import { StudentSchema } from '../../../src/db/wire/student';
import { JourneySchema } from '../../../src/db/wire/journey';
import { JourneyInitiatedSchema } from '../../../src/db/wire/journey-initiated';
import { DiagnosticTriggeredSchema } from '../../../src/db/wire/diagnostic-triggered';
import { DiagnosticCompletedSchema } from '../../../src/db/wire/diagnostic-completed';
import { AnalysisStartedSchema } from '../../../src/db/wire/analysis-started';
import { AnalysisFinishedSchema } from '../../../src/db/wire/analysis-finished';
import { CurriculumGeneratedSchema } from '../../../src/db/wire/curriculum-generated';
import { ContentDispatchedSchema } from '../../../src/db/wire/content-dispatched';
import { StudentEngagementReceivedSchema } from '../../../src/db/wire/student-engagement-received';
import { ProgressMilestoneReachedSchema } from '../../../src/db/wire/progress-milestone-reached';
import { JourneyCompletedSchema } from '../../../src/db/wire/journey-completed';

const schemas = [
  StudentSchema,
  JourneySchema,
  JourneyInitiatedSchema,
  DiagnosticTriggeredSchema,
  DiagnosticCompletedSchema,
  AnalysisStartedSchema,
  AnalysisFinishedSchema,
  CurriculumGeneratedSchema,
  ContentDispatchedSchema,
  StudentEngagementReceivedSchema,
  ProgressMilestoneReachedSchema,
  JourneyCompletedSchema,
];

export const TestDataSource = createTestDataSource(schemas);
