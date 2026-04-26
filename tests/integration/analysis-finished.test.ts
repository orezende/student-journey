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
import { AnalysisFinishedDbWire } from '../../src/db/wire/analysis-finished';
import { CurriculumGeneratedDbWire } from '../../src/db/wire/curriculum-generated';
import { analysisFinished } from '../../src/controllers/analysis-finished';

const journeyId = '11111111-1111-1111-1111-111111111111';
const afId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

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
  await AppDataSource.getRepository(CurriculumGeneratedDbWire).clear();
  await AppDataSource.getRepository(AnalysisFinishedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'ANALYSIS_FINISHED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(AnalysisFinishedDbWire).save(
    AppDataSource.getRepository(AnalysisFinishedDbWire).create({ id: afId, journey_id: journeyId }),
  );
}

describe('analysisFinished consumer', () => {
  it('inserts CurriculumGenerated with id = analysisFinished.id', async () => {
    await seed();
    await analysisFinished({ eventId: afId, journeyId });

    const records = await AppDataSource.getRepository(CurriculumGeneratedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(afId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to CURRICULUM_GENERATED', async () => {
    await seed();
    await analysisFinished({ eventId: afId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('CURRICULUM_GENERATED');
  });

  it('publishes curriculumGenerated with correct payload', async () => {
    await seed();
    await analysisFinished({ eventId: afId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(topic).toBe('curriculumGenerated');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(afId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await analysisFinished({ eventId: afId, journeyId });
    await analysisFinished({ eventId: afId, journeyId });

    const records = await AppDataSource.getRepository(CurriculumGeneratedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
