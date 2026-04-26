import 'dotenv/config';
import { Kafka } from 'kafkajs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Direction = 'consumer' | 'producer' | 'both';

interface TopicConfig {
  topic: string;
  direction: Direction;
}

interface TopicsFile {
  kafka_topics: Record<string, TopicConfig>;
}

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:29092';

const { kafka_topics }: TopicsFile = JSON.parse(
  readFileSync(resolve(__dirname, '../student-journey.json'), 'utf-8'),
);

const kafka = new Kafka({ brokers: [KAFKA_BROKER] });
const admin = kafka.admin();

async function run(): Promise<void> {
  await admin.connect();

  const existing = new Set(await admin.listTopics());
  const toCreate = Object.entries(kafka_topics).filter(([, { topic }]) => !existing.has(topic));

  if (toCreate.length === 0) {
    console.log('All topics already exist.');
    await admin.disconnect();
    return;
  }

  await admin.createTopics({
    topics: toCreate.map(([, { topic }]) => ({
      topic,
      numPartitions: 1,
      replicationFactor: 1,
    })),
  });

  for (const [name, { topic, direction }] of toCreate) {
    console.log(`Created topic "${topic}" [${name}] — direction: ${direction}`);
  }

  await admin.disconnect();
}

run().catch((err) => {
  console.error('Failed to create topics:', err);
  process.exit(1);
});
