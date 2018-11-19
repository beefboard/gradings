import * as db from './db/db';
import isUuid from 'is-uuid';

export interface Ratings {
  [postId: string]: any;
}

export async function grade(postId: string, username: string, vote: number) {
  if (!isUuid.anyNonNil(postId)) {
    return;
  }

  const normalisedVote = vote > 0 ? 1 : -1;

  await db.addRating(postId, username, normalisedVote);
}

export async function get(postIds: string[], username?: string): Promise<Ratings> {
  const tasks = [];
  tasks.push(Promise.all(postIds.map((postId: string) => db.getRating(postId))));

  if (username) {
    tasks.push(db.getUserRatings(username, postIds));
  } else {
    tasks.push(null);
  }
  const [ratings, userVotes] = await Promise.all(tasks);

  const ratingsMap: Ratings = {};

  for (let i = 0; i < postIds.length; i += 1) {
    const post = postIds[i];
    ratingsMap[post] = { grade: ratings[i] };

    if (username) {
      ratingsMap[post][username] =  userVotes[post];
    }
  }

  return ratingsMap;
}

export async function clear() {
  await db.clearRatings();
}
