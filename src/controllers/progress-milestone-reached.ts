import { asyncFn } from '../../lib/types/fn';
import { NotFoundError } from '../../lib/types/errors/index';
import { Event } from '../model/event';
import { buildEventRecord } from '../logic/event-record';
import { buildJourneyStepUpdate, buildJourneyStatusUpdate } from '../logic/journey';
import * as progressMilestoneReachedDb from '../db/progress-milestone-reached';
import * as journeyCompletedDb from '../db/journey-completed';
import * as journeyDb from '../db/journey';

export const progressMilestoneReached = asyncFn(Event, async (event) => {
  const previous = await progressMilestoneReachedDb.findById(event.eventId);
  if (!previous)
    throw new NotFoundError('ProgressMilestoneReached not found for eventId: ' + event.eventId);

  const existing = await journeyCompletedDb.findById(event.eventId);
  if (existing) return;

  await journeyCompletedDb.insert(buildEventRecord(event));
  await journeyDb.updateStep(
    buildJourneyStepUpdate({ id: previous.journeyId, currentStep: 'JOURNEY_COMPLETED' }),
  );
  await journeyDb.updateStatus(
    buildJourneyStatusUpdate({ id: previous.journeyId, status: 'completed' }),
  );
});
