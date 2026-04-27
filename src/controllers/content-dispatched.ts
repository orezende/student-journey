import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/types/errors/index';
import { publish } from '../../lib/messaging/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as contentDispatchedDb from '../db/content-dispatched';
import * as studentEngagementReceivedDb from '../db/student-engagement-received';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('studentEngagementReceived', event);
});

export const contentDispatched = asyncFn(Event, async (event) => {
  const previous = await contentDispatchedDb.findById(event.eventId);
  if (!previous)
    throw new NotFoundError('ContentDispatched not found for eventId: ' + event.eventId);

  const existing = await studentEngagementReceivedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await studentEngagementReceivedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(
    buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'STUDENT_ENGAGEMENT_RECEIVED' }),
  );
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
