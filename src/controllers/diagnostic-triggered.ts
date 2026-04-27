import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/types/errors/index';
import { publish } from '../../lib/messaging/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as diagnosticTriggeredDb from '../db/diagnostic-triggered';
import * as diagnosticCompletedDb from '../db/diagnostic-completed';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('diagnosticCompleted', event);
});

export const diagnosticTriggered = asyncFn(Event, async (event) => {
  const previous = await diagnosticTriggeredDb.findById(event.eventId);
  if (!previous)
    throw new NotFoundError('DiagnosticTriggered not found for eventId: ' + event.eventId);

  const existing = await diagnosticCompletedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await diagnosticCompletedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(
    buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'DIAGNOSTIC_COMPLETED' }),
  );
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
