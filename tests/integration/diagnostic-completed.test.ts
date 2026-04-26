import { vi, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { TestDataSource } from './helpers/data-source';

vi.mock('../../src/db/data-source', () => ({ AppDataSource: TestDataSource }));
vi.mock('../../lib/producer/index', () => ({
  publish: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

import { buildApp } from '../../src/app';
import { publish } from '../../lib/producer/index';
import { AppDataSource } from '../../src/db/data-source';
import { JourneyDbWire } from '../../src/db/wire/journey';
import { DiagnosticCompletedDbWire } from '../../src/db/wire/diagnostic-completed';
import { AnalysisStartedDbWire } from '../../src/db/wire/analysis-started';
import { diagnosticCompleted } from '../../src/controllers/diagnostic-completed';

const journeyId = '11111111-1111-1111-1111-111111111111';
const dcId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

beforeAll(async () => {
  await TestDataSource.initialize();
  buildApp();
});

afterAll(async () => {
  await TestDataSource.destroy();
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  await AppDataSource.getRepository(AnalysisStartedDbWire).clear();
  await AppDataSource.getRepository(DiagnosticCompletedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'DIAGNOSTIC_COMPLETED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(DiagnosticCompletedDbWire).save(
    AppDataSource.getRepository(DiagnosticCompletedDbWire).create({ id: dcId, journey_id: journeyId }),
  );
}

describe('diagnosticCompleted consumer', () => {
  it('inserts AnalysisStarted with id = diagnosticCompleted.id', async () => {
    await seed();
    await diagnosticCompleted({ eventId: dcId, journeyId });

    const records = await AppDataSource.getRepository(AnalysisStartedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(dcId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to ANALYSIS_STARTED', async () => {
    await seed();
    await diagnosticCompleted({ eventId: dcId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('ANALYSIS_STARTED');
  });

  it('publishes analysisStarted with correct payload', async () => {
    await seed();
    await diagnosticCompleted({ eventId: dcId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(topic).toBe('analysisStarted');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(dcId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await diagnosticCompleted({ eventId: dcId, journeyId });
    await diagnosticCompleted({ eventId: dcId, journeyId });

    const records = await AppDataSource.getRepository(AnalysisStartedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
