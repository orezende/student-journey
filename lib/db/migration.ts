export type MigrationRunner = {
  query(sql: string, params?: unknown[]): Promise<unknown>;
};

export abstract class Migration {
  abstract name: string;
  abstract up(runner: MigrationRunner): Promise<void>;
  down(_runner: MigrationRunner): Promise<void> {
    return Promise.resolve();
  }
}

export async function sql(runner: MigrationRunner, query: string): Promise<void> {
  await runner.query(query);
}
