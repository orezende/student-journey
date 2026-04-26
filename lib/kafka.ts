import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'student-journey',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
});
