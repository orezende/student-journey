import { kafka } from '../../lib/messaging/kafka';

export async function checkKafka(): Promise<boolean> {
  const admin = kafka.admin();
  try {
    await admin.connect();
    await admin.listTopics();
    return true;
  } catch {
    return false;
  } finally {
    await admin.disconnect().catch(() => {});
  }
}
