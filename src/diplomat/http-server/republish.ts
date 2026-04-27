import { post } from '../../../lib/http/server/index';
import { republishStuckJourneys } from '../../controllers/republish';

export function registerRepublishRoutes(): void {
  post('/journeys/republish', async () => republishStuckJourneys({}));
}
