import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Direction = 'consumer' | 'producer' | 'both';

interface KafkaTopicEntry {
  topic: string;
  direction: Direction;
}

interface HttpMappedEntry {
  service: string;
  path: string;
}

interface AppConfig {
  kafka_topics: Record<string, KafkaTopicEntry>;
  http_mapped: Record<string, HttpMappedEntry>;
}

const config: AppConfig = JSON.parse(
  readFileSync(resolve(process.cwd(), 'student-journey.json'), 'utf-8'),
);

export function getKafkaTopic(name: string): string {
  const entry = config.kafka_topics?.[name];
  if (!entry) {
    throw new Error(`Kafka topic "${name}" is not configured in student-journey.json`);
  }
  return entry.topic;
}

export function getHttpEndpoint(name: string): { url: string } {
  const entry = config.http_mapped?.[name];
  if (!entry) {
    throw new Error(`HTTP endpoint "${name}" is not configured in student-journey.json`);
  }
  if (!entry.service) {
    throw new Error(`HTTP endpoint "${name}" has no service configured in student-journey.json`);
  }
  return { url: `${entry.service}${entry.path}` };
}
