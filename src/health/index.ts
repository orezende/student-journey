import { checkDatabase } from './database';
import { checkKafka } from './kafka';

interface HealthResult {
  status: 'ok' | 'degraded';
  dependencies: {
    database: boolean;
    kafka: boolean;
  };
}

export async function checkHealth(): Promise<HealthResult> {
  const [database, kafka] = await Promise.all([checkDatabase(), checkKafka()]);
  const status = database && kafka ? 'ok' : 'degraded';
  return { status, dependencies: { database, kafka } };
}
