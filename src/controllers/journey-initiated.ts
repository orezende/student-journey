import { asyncFn } from '../../lib/types/fn';
import { Event } from '../model/event';

export const journeyStarted = asyncFn(Event, async (event) => {
  console.log('mensagem chegou', event);
});
