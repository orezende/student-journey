import { AppDataSource } from '../db/data-source';

export async function checkDatabase(): Promise<boolean> {
  try {
    await AppDataSource.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
