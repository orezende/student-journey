import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/types/errors/index';
import { publish } from '../../lib/messaging/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as studentEngagementReceivedDb from '../db/student-engagement-received';
import * as progressMilestoneReachedDb from '../db/progress-milestone-reached';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('progressMilestoneReached', event);
});

export const studentEngagementReceived = asyncFn(Event, async (event) => {
  const previous = await studentEngagementReceivedDb.findById(event.eventId);
  if (!previous)
    throw new NotFoundError('StudentEngagementReceived not found for eventId: ' + event.eventId);

  const existing = await progressMilestoneReachedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await progressMilestoneReachedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(
    buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'PROGRESS_MILESTONE_REACHED' }),
  );
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
