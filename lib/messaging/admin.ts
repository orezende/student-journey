import { kafka } from './kafka';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface KafkaTopicEntry {
  topic: string;
}

interface TopicsFile {
  kafka_topics: Record<string, KafkaTopicEntry>;
}

const { kafka_topics }: TopicsFile = JSON.parse(
  readFileSync(resolve(process.cwd(), 'student-journey.json'), 'utf-8'),
);

export async function ensureTopics(): Promise<void> {
  const admin = kafka.admin();
  await admin.connect();

  const existing = new Set(await admin.listTopics());
  const toCreate = Object.values(kafka_topics)
    .map(({ topic }) => topic)
    .filter((topic) => !existing.has(topic));

  if (toCreate.length > 0) {
    await admin.createTopics({
      topics: toCreate.map((topic) => ({ topic, numPartitions: 1, replicationFactor: 1 })),
    });
  }

  await admin.disconnect();
}
