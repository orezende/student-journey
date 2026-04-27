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
import { ContentDispatchedDbWire } from '../../src/db/wire/content-dispatched';
import { StudentEngagementReceivedDbWire } from '../../src/db/wire/student-engagement-received';
import { contentDispatched } from '../../src/controllers/content-dispatched';

const journeyId = '11111111-1111-1111-1111-111111111111';
const cdId = '00000000-0000-0000-0000-000000000001';

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
  await AppDataSource.getRepository(StudentEngagementReceivedDbWire).clear();
  await AppDataSource.getRepository(ContentDispatchedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
});

async function seed() {
  await AppDataSource.getRepository(JourneyDbWire).save(
    AppDataSource.getRepository(JourneyDbWire).create({
      id: journeyId,
      student_id: '22222222-2222-2222-2222-222222222222',
      current_step: 'CONTENT_DISPATCHED',
      status: 'active',
    }),
  );
  await AppDataSource.getRepository(ContentDispatchedDbWire).save(
    AppDataSource.getRepository(ContentDispatchedDbWire).create({ id: cdId, journey_id: journeyId }),
  );
}

describe('contentDispatched consumer', () => {
  it('inserts StudentEngagementReceived with id = contentDispatched.id', async () => {
    await seed();
    await contentDispatched({ eventId: cdId, journeyId });

    const records = await AppDataSource.getRepository(StudentEngagementReceivedDbWire).find();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe(cdId);
    expect(records[0].journey_id).toBe(journeyId);
  });

  it('updates journey current_step to STUDENT_ENGAGEMENT_RECEIVED', async () => {
    await seed();
    await contentDispatched({ eventId: cdId, journeyId });

    const journey = await AppDataSource.getRepository(JourneyDbWire).findOneByOrFail({ id: journeyId });
    expect(journey.current_step).toBe('STUDENT_ENGAGEMENT_RECEIVED');
  });

  it('publishes studentEngagementReceived with correct payload', async () => {
    await seed();
    await contentDispatched({ eventId: cdId, journeyId });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof test.fn>).mock.calls[0];
    expect(topic).toBe('studentEngagementReceived');
    expect(payload.journeyId).toBe(journeyId);
    expect(payload.eventId).toBe(cdId);
  });

  it('is idempotent — second call re-publishes without inserting duplicate', async () => {
    await seed();
    await contentDispatched({ eventId: cdId, journeyId });
    await contentDispatched({ eventId: cdId, journeyId });

    const records = await AppDataSource.getRepository(StudentEngagementReceivedDbWire).find();
    expect(records).toHaveLength(1);
    expect(publish).toHaveBeenCalledTimes(2);
  });
});
