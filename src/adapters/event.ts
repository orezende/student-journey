import { fn } from '../../lib/types/fn';
import { toUUID } from '../../lib/types/uuid';
import { Event } from '../model/event';
import { EventWireIn } from '../wire/in/event';

export const toModel = fn(
  EventWireIn,
  Event,
  (wire) => ({
    eventId: toUUID(wire.eventId),
    journeyId: toUUID(wire.journeyId),
  }),
);
