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
import { DiagnosticTriggeredDbWire } from '../../src/db/wire/diagnostic-triggered';
import { DiagnosticCompletedDbWire } from '../../src/db/wire/diagnostic-completed';
import { diagnosticTriggered } from '../../src/controllers/diagnostic-triggered';

const journeyId = '11111111-1111-1111-1111-111111111111';
const dtId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

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
  await AppDataSource.getRepository(DiagnosticCompletedDbWire).clear();
  await AppDataSource.getRepository(DiagnosticTriggeredDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'DIAGNOSTIC_TRIGGERED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(DiagnosticTriggeredDbWire).save(
    AppDataSource.getRepository(DiagnosticTriggeredDbWire).create({ id: dtId, journey_id: journeyId }),
  );
}

describe('diagnosticTriggered consumer', () => {
  it('inserts DiagnosticCompleted with id = diagnosticTriggered.id', async () => {
    await seed();
    await diagnosticTriggered({ eventId: dtId, journeyId });

    const records = await AppDataSource.getRepository(DiagnosticCompletedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(dtId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to DIAGNOSTIC_COMPLETED', async () => {
    await seed();
    await diagnosticTriggered({ eventId: dtId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('DIAGNOSTIC_COMPLETED');
  });

  it('publishes diagnosticCompleted with correct payload', async () => {
    await seed();
    await diagnosticTriggered({ eventId: dtId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(topic).toBe('diagnosticCompleted');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(dtId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await diagnosticTriggered({ eventId: dtId, journeyId });
    await diagnosticTriggered({ eventId: dtId, journeyId });

    const records = await AppDataSource.getRepository(DiagnosticCompletedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
