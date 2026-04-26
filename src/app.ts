import { get } from '../lib/http-server/index';
import { setupRoutes } from './diplomat/http-server/index';

export function buildApp(): void {
  get('/health', async () => ({ status: 'ok' }));
  setupRoutes();
}
