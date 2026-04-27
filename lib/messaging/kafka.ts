import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'student-journey',
  brokers: [process.env.KAFKA_BROKER || 'localhost:29092'],
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});
