import * as db from './db';

describe('db', () => {
  describe('initdb', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should initialise with sqlite in test mode', async () => {
      await db.initDb();
      expect(db.db.client.config.client).toBe('sqlite3');
    });

    it('should initialise with pg when not in test mode', async () => {
      process.env.NODE_ENV = 'production';
      // Don't expect postgress table generation to work
      try {
        await db.initDb();
      } catch (_) {}
      expect(db.db.client.config.client).toBe('pg');
    });

    it('should generate ratings table', async () => {
      await db.initDb();
      expect(await db.db.schema.hasTable(db.TABLE_RATINGS)).toBe(true);
    });
  });

  describe('generateInitialTables', async () => {
    it('should not not generate tables if they already exist', async () => {
      await db.initDb();
      let thrown = null;
      try {
        await db.generateTables();
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBe(null);
    });
  });
});
