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
import { ProgressMilestoneReachedDbWire } from '../../src/db/wire/progress-milestone-reached';
import { JourneyCompletedDbWire } from '../../src/db/wire/journey-completed';
import { progressMilestoneReached } from '../../src/controllers/progress-milestone-reached';

const journeyId = '11111111-1111-1111-1111-111111111111';
const pmrId = '00000000-0000-0000-0000-000000000003';

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
  await AppDataSource.getRepository(JourneyCompletedDbWire).clear();
  await AppDataSource.getRepository(ProgressMilestoneReachedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'PROGRESS_MILESTONE_REACHED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(ProgressMilestoneReachedDbWire).save(
    AppDataSource.getRepository(ProgressMilestoneReachedDbWire).create({ id: pmrId, journey_id: journeyId }),
  );
}

describe('progressMilestoneReached consumer', () => {
  it('inserts JourneyCompleted with id = progressMilestoneReached.id', async () => {
    await seed();
    await progressMilestoneReached({ eventId: pmrId, journeyId });

    const records = await AppDataSource.getRepository(JourneyCompletedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(pmrId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to JOURNEY_COMPLETED', async () => {
    await seed();
    await progressMilestoneReached({ eventId: pmrId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('JOURNEY_COMPLETED');
  });

  it('updates journey status to completed', async () => {
    await seed();
    await progressMilestoneReached({ eventId: pmrId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.status).toBe('completed');
  });

  it('does not publish any event', async () => {
    await seed();
    await progressMilestoneReached({ eventId: pmrId, journeyId });

    expect(publish).not.toHaveBeenCalled();
  });

  it('is idempotent — second call does not insert duplicate', async () => {
    await seed();
    await progressMilestoneReached({ eventId: pmrId, journeyId });
    await progressMilestoneReached({ eventId: pmrId, journeyId });

    const records = await AppDataSource.getRepository(JourneyCompletedDbWire).find();
    expect(records).toHaveLength(1);
  });
});
