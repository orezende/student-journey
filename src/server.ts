import 'reflect-metadata';
import { AppDataSource } from './db/data-source';
import { listen, close } from '../lib/http-server/index';
import { connect, disconnect } from '../lib/producer/index';
import { buildApp } from './app';
import { setupConsumers } from './diplomat/consumer/index';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function shutdown() {
  await close();
  await disconnect();
  await AppDataSource.destroy();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

AppDataSource.initialize()
  .then(async () => {
    await connect();
    setupConsumers();
    buildApp();
    return listen(PORT, HOST);
  })
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
