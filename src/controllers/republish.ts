import { asyncFn } from '../../lib/types/fn';
import { RepublishWireIn } from '../wire/in/republish';
import { RepublishWireOut } from '../wire/out/republish';
import { publish } from '../../lib/messaging/producer/index';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';
import { buildJourneyInitiated } from '../logic/journey-initiated';
import * as journeyDb from '../db/journey';
import * as journeyInitiatedDb from '../db/journey-initiated';

const sideEffect = asyncFn(Event, async (event) => {
  await publish('journeyInitiated', event);
});

export const republishStuckJourneys = asyncFn(RepublishWireIn, RepublishWireOut, async () => {
  const journeys = await journeyDb.findAll();

  const checks = await Promise.all(
    journeys.map((journey) => journeyInitiatedDb.findByJourneyId(journey.id)),
  );

  const stuck = journeys.filter((_, i) => checks[i] === null);

  await Promise.all(
    stuck.map(async (journey) => {
      const record = await journeyInitiatedDb.insert(buildJourneyInitiated(journey));
      await sideEffect(buildEvent({ journeyId: record.journeyId, eventId: record.id }));
    }),
  );

  return { republished: stuck.length };
});
