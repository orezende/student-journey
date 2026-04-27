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
import { StudentEngagementReceivedDbWire } from '../../src/db/wire/student-engagement-received';
import { ProgressMilestoneReachedDbWire } from '../../src/db/wire/progress-milestone-reached';
import { studentEngagementReceived } from '../../src/controllers/student-engagement-received';

const journeyId = '11111111-1111-1111-1111-111111111111';
const serId = '00000000-0000-0000-0000-000000000002';

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
  await AppDataSource.getRepository(ProgressMilestoneReachedDbWire).clear();
  await AppDataSource.getRepository(StudentEngagementReceivedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'STUDENT_ENGAGEMENT_RECEIVED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(StudentEngagementReceivedDbWire).save(
    AppDataSource.getRepository(StudentEngagementReceivedDbWire).create({ id: serId, journey_id: journeyId }),
  );
}

describe('studentEngagementReceived consumer', () => {
  it('inserts ProgressMilestoneReached with id = studentEngagementReceived.id', async () => {
    await seed();
    await studentEngagementReceived({ eventId: serId, journeyId });

    const records = await AppDataSource.getRepository(ProgressMilestoneReachedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(serId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to PROGRESS_MILESTONE_REACHED', async () => {
    await seed();
    await studentEngagementReceived({ eventId: serId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('PROGRESS_MILESTONE_REACHED');
  });

  it('publishes progressMilestoneReached with correct payload', async () => {
    await seed();
    await studentEngagementReceived({ eventId: serId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof test.fn>).mock.calls[0];
    expect(topic).toBe('progressMilestoneReached');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(serId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await studentEngagementReceived({ eventId: serId, journeyId });
    await studentEngagementReceived({ eventId: serId, journeyId });

    const records = await AppDataSource.getRepository(ProgressMilestoneReachedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
