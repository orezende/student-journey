import { get, html, post } from '../lib/http/server/index';
import { renderDashboard } from '../lib/http/dashboard';
import { renderApiDocs } from '../lib/http/docs';
import { renderOverview } from '../lib/http/overview';
import { setupRoutes } from './diplomat/http-server/index';
import { checkHealth } from './health/index';
import { startContainer, stopContainer } from '../lib/docker/index';
import { openApiSpec } from './docs/openapi';

export function buildApp(): void {
  get('/health', () => checkHealth());

  html('/docs', async () => renderApiDocs(openApiSpec));
  html('/overview', async () => renderOverview());

  html('/', async () => {
    const health = await checkHealth();
    return renderDashboard([
      {
        name: 'API',
        url: 'http://localhost:3000',
        description: 'Student Journey REST API',
        status: true,
      },
      {
        name: 'Kafka UI',
        url: 'http://localhost:8080',
        description: 'Topics, messages, consumer groups',
        status: health.dependencies.kafka,
        containerName: 'student-journey-kafka-ui-1',
      },
      {
        name: 'Grafana',
        url: 'http://localhost:4000',
        description: 'Logs via Loki',
        containerName: 'student-journey-grafana-1',
      },
      {
        name: 'PostgreSQL',
        description: 'localhost:5432 · student_journey',
        status: health.dependencies.database,
        containerName: 'student-journey-postgres-1',
      },
      {
        name: 'Kafka',
        description: 'Broker · localhost:29092',
        status: health.dependencies.kafka,
        containerName: 'student-journey-kafka-1',
      },
    ]);
  });

  post('/services/start', async ({ name }: { name: string }) => {
    await startContainer(name);
    return { ok: true };
  });

  post('/services/stop', async ({ name }: { name: string }) => {
    await stopContainer(name);
    return { ok: true };
  });

  setupRoutes();
}
