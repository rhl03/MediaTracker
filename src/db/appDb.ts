import { open } from '@op-engineering/op-sqlite';
import { Db, QueryResult, Row, SqlValue } from './database';
import { migrate } from './schema';

let appDbPromise: Promise<Db> | null = null;

async function openAppDb(): Promise<Db> {
  const sqlite = open({ name: 'mediatracker.sqlite' });

  const db: Db = {
    async execute(sql: string, params: SqlValue[] = []): Promise<QueryResult> {
      const result = await sqlite.execute(sql, params);
      // The schema only stores text, integers and NULL, so every value fits SqlValue.
      return {
        rows: result.rows as Row[],
        rowsAffected: result.rowsAffected,
        insertId: result.insertId,
      };
    },
  };

  await db.execute('PRAGMA foreign_keys = ON');
  await migrate(db);
  return db;
}


export function getAppDb(): Promise<Db> {
  if (appDbPromise === null) {
    appDbPromise = openAppDb().catch((error: unknown) => {
      appDbPromise = null;
      throw error;
    });
  }

  return appDbPromise;
}

