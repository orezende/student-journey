import { test, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from '../../lib/testing';
import { TestDataSource } from './helpers/data-source';

test.mock('../../src/db/data-source', () => ({ AppDataSource: TestDataSource }));
test.mock('../../lib/messaging/producer/index', () => ({
  publish: test.fn(),
  connect: test.fn(),
  disconnect: test.fn(),
}));

import { buildApp } from '../../src/app';
import { publish } from '../../lib/messaging/producer/index';
import { AppDataSource } from '../../src/db/data-source';
import { JourneyDbWire } from '../../src/db/wire/journey';
import { AnalysisStartedDbWire } from '../../src/db/wire/analysis-started';
import { AnalysisFinishedDbWire } from '../../src/db/wire/analysis-finished';
import { analysisStarted } from '../../src/controllers/analysis-started';

const journeyId = '11111111-1111-1111-1111-111111111111';
const asId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

beforeAll(async () => {
  await TestDataSource.initialize();
  buildApp();
});

afterAll(async () => {
  await TestDataSource.destroy();
});

beforeEach(() => {
  test.clearAll();
});

afterEach(async () => {
  await AppDataSource.getRepository(AnalysisFinishedDbWire).clear();
  await AppDataSource.getRepository(AnalysisStartedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'ANALYSIS_STARTED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(AnalysisStartedDbWire).save(
    AppDataSource.getRepository(AnalysisStartedDbWire).create({ id: asId, journey_id: journeyId }),
  );
}

describe('analysisStarted consumer', () => {
  it('inserts AnalysisFinished with id = analysisStarted.id', async () => {
    await seed();
    await analysisStarted({ eventId: asId, journeyId });

    const records = await AppDataSource.getRepository(AnalysisFinishedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(asId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to ANALYSIS_FINISHED', async () => {
    await seed();
    await analysisStarted({ eventId: asId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('ANALYSIS_FINISHED');
  });

  it('publishes analysisFinished with correct payload', async () => {
    await seed();
    await analysisStarted({ eventId: asId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof test.fn>).mock.calls[0];
    expect(topic).toBe('analysisFinished');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(asId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await analysisStarted({ eventId: asId, journeyId });
    await analysisStarted({ eventId: asId, journeyId });

    const records = await AppDataSource.getRepository(AnalysisFinishedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
