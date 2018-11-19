import knex from 'knex';
import uuidParse from 'uuid-parse';

export const TABLE_RATINGS = 'ratings';

const pgConnectionConfig = {
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'example',
  database: process.env.PG_DB || 'test',
};

export let db: knex;

function convertUuid(id: string) {
  return Buffer.from(uuidParse.parse(id));
}

async function generateRatingsTable() {
  if (!await db.schema.hasTable(TABLE_RATINGS)) {
    await db.schema.createTable(TABLE_RATINGS, (table) => {
      table.binary('postId').notNullable();
      table.string('user').notNullable();
      table.integer('vote').notNullable();
      table.primary(['postId', 'user']);
    });
  }
}

export async function generateTables() {
  await generateRatingsTable();
}

export async function initDb() {
  if (process.env.NODE_ENV === 'test') {
    db = knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
      },
      useNullAsDefault: true,
      pool: { min: 0, max: 1 }
    });
  } else {
    db = knex({
      client: 'pg',
      connection: pgConnectionConfig,
      pool: { min: 0, max: 10 }
    });
  }

  await generateTables();
}

export async function addRating(postId: string, username: string, vote: number) {
  try {
    await db.insert({
      postId: convertUuid(postId),
      user: username,
      vote: vote
    }).into(TABLE_RATINGS);
  } catch (e) {
    await db.update({
      vote: vote
    })
    .table(TABLE_RATINGS)
    .where('postId', convertUuid(postId))
    .andWhere('user', username);
  }
}

export async function getRating(postId: string): Promise<number> {
  const row = await db.sum('vote')
    .from(TABLE_RATINGS)
    .where('postId', convertUuid(postId))
    .first();
  if (!row || !row['sum(`vote`)']) {
    return 0;
  }

  return row['sum(`vote`)'];
}

export async function getUserRatings(username: string, postIds: string[]) {
  const rows = await db.select('postId', 'vote')
    .from(TABLE_RATINGS)
    .whereIn('postId', postIds.map((postId: string) => convertUuid(postId)))
    .andWhere('user', username);

  const ratings: any = {};

  // Default rating for a post id is 0
  postIds.forEach((postId: string) => ratings[postId] = 0);

  for (const row of rows) {
    const postId = uuidParse.unparse(row['postId']);
    ratings[postId] = row['vote'];
  }

  return ratings;
}

export async function clearRatings() {
  await db.delete().from(TABLE_RATINGS);
}
