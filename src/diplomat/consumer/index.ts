import { subscribe } from '../../../lib/messaging/consumer/index';
import { asyncFn } from '../../../lib/types/fn';
import { EventWireIn } from '../../wire/in/event';
import { toModel } from '../../adapters/event';
import { journeyStarted } from '../../controllers/journey-initiated';
import { diagnosticTriggered } from '../../controllers/diagnostic-triggered';
import { diagnosticCompleted } from '../../controllers/diagnostic-completed';
import { analysisStarted } from '../../controllers/analysis-started';
import { analysisFinished } from '../../controllers/analysis-finished';
import { curriculumGenerated } from '../../controllers/curriculum-generated';
import { contentDispatched } from '../../controllers/content-dispatched';
import { studentEngagementReceived } from '../../controllers/student-engagement-received';
import { progressMilestoneReached } from '../../controllers/progress-milestone-reached';

const handle = (controller: (raw: unknown) => Promise<void>) =>
  asyncFn(EventWireIn, async (wire) => controller(toModel(wire)));

export function setupConsumers(): void {
  subscribe('journeyInitiated', handle(journeyStarted));
  subscribe('diagnosticTriggered', handle(diagnosticTriggered));
  subscribe('diagnosticCompleted', handle(diagnosticCompleted));
  subscribe('analysisStarted', handle(analysisStarted));
  subscribe('analysisFinished', handle(analysisFinished));
  subscribe('curriculumGenerated', handle(curriculumGenerated));
  subscribe('contentDispatched', handle(contentDispatched));
  subscribe('studentEngagementReceived', handle(studentEngagementReceived));
  subscribe('progressMilestoneReached', handle(progressMilestoneReached));
}
