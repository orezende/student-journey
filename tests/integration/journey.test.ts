import { vi, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { TestDataSource } from './helpers/data-source';

vi.mock('../../src/db/data-source', () => ({ AppDataSource: TestDataSource }));
vi.mock('../../lib/producer/index', () => ({
  publish: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
}));

import { buildApp } from '../../src/app';
import { inject } from '../../lib/http-server/index';
import { publish } from '../../lib/producer/index';
import { AppDataSource } from '../../src/db/data-source';
import { StudentDbWire } from '../../src/db/wire/student';
import { JourneyDbWire } from '../../src/db/wire/journey';
import { JourneyInitiatedDbWire } from '../../src/db/wire/journey-initiated';

const validBody = { name: 'Alice', email: 'alice@example.com' };

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
  await AppDataSource.getRepository(JourneyInitiatedDbWire).clear();
  await AppDataSource.getRepository(JourneyDbWire).clear();
  await AppDataSource.getRepository(StudentDbWire).clear();
});

describe('POST /journeys', () => {
  it('returns 201 with journey fields', async () => {
    const res = await inject({ method: 'POST', url: '/journeys', body: validBody });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.id).toBeDefined();
    expect(body.studentId).toBeDefined();
    expect(body.currentStep).toBe('JOURNEY_INITIATED');
    expect(body.status).toBe('active');
    expect(body.createdAt).toBeDefined();
  });

  it('inserts Student in the database', async () => {
    await inject({ method: 'POST', url: '/journeys', body: validBody });

    const students = await AppDataSource.getRepository(StudentDbWire).find();
    expect(students).toHaveLength(1);
    expect(students[0].name).toBe('Alice');
    expect(students[0].email).toBe('alice@example.com');
  });

  it('inserts Journey with correct step and status', async () => {
    await inject({ method: 'POST', url: '/journeys', body: validBody });

    const journeys = await AppDataSource.getRepository(JourneyDbWire).find();
    expect(journeys).toHaveLength(1);
    expect(journeys[0].current_step).toBe('JOURNEY_INITIATED');
    expect(journeys[0].status).toBe('active');
  });

  it('inserts JourneyInitiated linked to the Journey', async () => {
    await inject({ method: 'POST', url: '/journeys', body: validBody });

    const journeys = await AppDataSource.getRepository(JourneyDbWire).find();
    const events = await AppDataSource.getRepository(JourneyInitiatedDbWire).find();
    expect(events).toHaveLength(1);
    expect(events[0].journey_id).toBe(journeys[0].id);
  });

  it('calls publish with journeyInitiated topic and correct payload', async () => {
    await inject({ method: 'POST', url: '/journeys', body: validBody });

    expect(publish).toHaveBeenCalledOnce();
    const [topic, payload] = (publish as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(topic).toBe('journeyInitiated');
    expect(payload.journeyId).toBeDefined();
    expect(payload.eventId).toBeDefined();
  });

  it('reuses the same Student on duplicate email', async () => {
    await inject({ method: 'POST', url: '/journeys', body: validBody });
    await inject({ method: 'POST', url: '/journeys', body: validBody });

    const students = await AppDataSource.getRepository(StudentDbWire).find();
    expect(students).toHaveLength(1);
  });

  it('returns 400 on missing name', async () => {
    const res = await inject({ method: 'POST', url: '/journeys', body: { email: 'alice@example.com' } });
    expect(res.statusCode).toBe(400);
  });
});
