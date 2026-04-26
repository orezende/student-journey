import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/errors/index';
import { publish } from '../../lib/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as diagnosticCompletedDb from '../db/diagnostic-completed';
import * as analysisStartedDb from '../db/analysis-started';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('analysisStarted', event);
});

export const diagnosticCompleted = asyncFn(Event, async (event) => {
  const previous = await diagnosticCompletedDb.findById(event.eventId);
  if (!previous) throw new NotFoundError('DiagnosticCompleted not found for eventId: ' + event.eventId);

  const existing = await analysisStartedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await analysisStartedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'ANALYSIS_STARTED' }));
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
