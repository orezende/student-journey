import { get } from '../lib/http/server/index';
import { setupRoutes } from './diplomat/http-server/index';
import { checkHealth } from './health/index';

export function buildApp(): void {
  get('/health', () => checkHealth());
  setupRoutes();
}
