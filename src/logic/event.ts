import { fn } from '../../lib/types/fn';
import { Event } from '../model/event';

export const buildEvent = fn(Event, Event, (input) => ({
  journeyId: input.journeyId,
  eventId: input.eventId,
}));
