import { subscribe } from '../../../lib/consumer/index';
import { asyncFn } from '../../../lib/types/fn';
import { EventWireIn } from '../../wire/in/event';
import { toModel } from '../../adapters/event';
import { journeyStarted } from '../../controllers/journey-initiated';

const handleJourneyInitiated = asyncFn(EventWireIn, async (wire) => {
  await journeyStarted(toModel(wire));
});

export function setupConsumers(): void {
  subscribe('journeyInitiated', handleJourneyInitiated);
}
