import { registerJourneyRoutes } from './journey';
import { registerTimelineRoutes } from './timeline';

export function setupRoutes(): void {
  registerJourneyRoutes();
  registerTimelineRoutes();
}
