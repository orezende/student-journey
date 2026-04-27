import { registerJourneyRoutes } from './journey';
import { registerTimelineRoutes } from './timeline';
import { registerRepublishRoutes } from './republish';

export function setupRoutes(): void {
  registerJourneyRoutes();
  registerTimelineRoutes();
  registerRepublishRoutes();
}
