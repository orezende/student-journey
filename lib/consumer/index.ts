import { logger } from '../logger';
import { getKafkaTopic } from '../config';
import { nextCid } from '../cid';
import { kafka } from '../kafka';

export type MessageHandler<T = unknown> = (message: T) => Promise<void> | void;

export function subscribe<T extends { cid?: string; eventId?: string; journeyId?: string }>(
  name: string,
  handler: MessageHandler<T>,
): void {
  const topic = getKafkaTopic(name);
  const consumer = kafka.consumer({ groupId: `student-journey-${name}` });

  consumer
    .connect()
    .then(() => consumer.subscribe({ topic, fromBeginning: false }))
    .then(() => {
      logger.info({ topic, name }, 'consumer: subscribed');
      return consumer.run({
        eachMessage: async ({ message }) => {
          const raw = message.value?.toString();
          if (!raw) return;
          const payload = JSON.parse(raw) as T;
          const incoming = (payload as { cid?: string }).cid;
          const cid = incoming ? nextCid(incoming) : undefined;
          logger.info({ cid, topic, name, eventId: (payload as { eventId?: string }).eventId }, 'consumer: message received');
          await handler(payload);
        },
      });
    })
    .catch((err) => {
      logger.error({ err, topic, name }, 'consumer: failed to start');
    });
}
