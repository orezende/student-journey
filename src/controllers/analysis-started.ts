import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/errors/index';
import { publish } from '../../lib/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate } from '../logic/journey';
import * as analysisStartedDb from '../db/analysis-started';
import * as analysisFinishedDb from '../db/analysis-finished';
import * as journeyDb from '../db/journey';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('analysisFinished', event);
});

export const analysisStarted = asyncFn(Event, async (event) => {
  const previous = await analysisStartedDb.findById(event.eventId);
  if (!previous) throw new NotFoundError('AnalysisStarted not found for eventId: ' + event.eventId);

  const existing = await analysisFinishedDb.findById(event.eventId);
  if (existing) {
    await sideEffect(buildEvent({ journeyId: existing.journeyId, eventId: existing.id }));
    return;
  }

  const current = await analysisFinishedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'ANALYSIS_FINISHED' }));
  await sideEffect(buildEvent({ journeyId: current.journeyId, eventId: current.id }));
});
