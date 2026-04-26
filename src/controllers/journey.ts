import { asyncFn } from '../../lib/types/fn';
import { StudentInput } from '../model/student';
import { Journey } from '../model/journey';
import { buildStudent } from '../logic/student';
import { buildJourney } from '../logic/journey';
import * as studentDb from '../db/student';
import * as journeyDb from '../db/journey';
import * as journeyInitiatedDb from '../db/journey-initiated';
import { publish } from '../../lib/producer/index';
import { buildJourneyInitiated } from '../logic/journey-initiated';
import { Event } from '../model/event';
import { buildEvent } from '../logic/event';

const sideEffect = asyncFn(Event, async (event) => {
  publish('journeyInitiated', event);
});

export const startJourney = asyncFn(
  StudentInput,
  Journey,
  async (studentInput) => {
    let student = await studentDb.findByEmail(studentInput.email);
    if (!student) {
      student = await studentDb.insert(buildStudent(studentInput));
    }

    const journey = await journeyDb.insert(buildJourney({ studentId: student.id }));
    const journeyInitiated = await journeyInitiatedDb.insert(buildJourneyInitiated(journey));

    const eventPayload = buildEvent({ journeyId: journeyInitiated.journeyId, eventId: journeyInitiated.id });

    await sideEffect(eventPayload);

    return journey;
  },
);
