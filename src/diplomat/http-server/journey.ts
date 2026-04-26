import { post } from '../../../lib/http-server/index';
import { fromWireIn, toWireOut } from '../../adapters/journey';
import { startJourney } from '../../controllers/journey';

export function registerJourneyRoutes(): void {
  post('/journeys', async (body) => {
    const studentInput = fromWireIn(body);
    const journey = await startJourney(studentInput);
    return toWireOut(journey);
  });
}
