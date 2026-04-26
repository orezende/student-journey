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
import { JourneyInitiatedDbWire } from '../../src/db/wire/journey-initiated';
import { DiagnosticTriggeredDbWire } from '../../src/db/wire/diagnostic-triggered';
import { journeyStarted } from '../../src/controllers/journey-initiated';

const journeyId = '11111111-1111-1111-1111-111111111111';
const jiId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

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
  await AppDataSource.getRepository(DiagnosticTriggeredDbWire).clear();
  await AppDataSource.getRepository(JourneyInitiatedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'JOURNEY_INITIATED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(JourneyInitiatedDbWire).save(
    AppDataSource.getRepository(JourneyInitiatedDbWire).create({ id: jiId, journey_id: journeyId }),
  );
}

describe('journeyStarted consumer', () => {
  it('inserts DiagnosticTriggered with id = journeyInitiated.id', async () => {
    await seed();
    await journeyStarted({ eventId: jiId, journeyId });

    const records = await AppDataSource.getRepository(DiagnosticTriggeredDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(jiId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to DIAGNOSTIC_TRIGGERED', async () => {
    await seed();
    await journeyStarted({ eventId: jiId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('DIAGNOSTIC_TRIGGERED');
  });

  it('publishes diagnosticTriggered with correct payload', async () => {
    await seed();
    await journeyStarted({ eventId: jiId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(topic).toBe('diagnosticTriggered');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(jiId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await journeyStarted({ eventId: jiId, journeyId });
    await journeyStarted({ eventId: jiId, journeyId });

    const records = await AppDataSource.getRepository(DiagnosticTriggeredDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
