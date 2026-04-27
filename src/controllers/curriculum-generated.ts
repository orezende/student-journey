import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/types/errors/index';
import { publish } from '../../lib/messaging/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as curriculumGeneratedDb from '../db/curriculum-generated';
import * as contentDispatchedDb from '../db/content-dispatched';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('contentDispatched', event);
});

export const curriculumGenerated = asyncFn(Event, async (event) => {
  const previous = await curriculumGeneratedDb.findById(event.eventId);
  if (!previous)
    throw new NotFoundError('CurriculumGenerated not found for eventId: ' + event.eventId);

  const existing = await contentDispatchedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await contentDispatchedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(
    buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'CONTENT_DISPATCHED' }),
  );
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
