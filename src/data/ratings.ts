import * as db from './db/db';
import isUuid from 'is-uuid';

export interface Rating {
  grade: number;
  user?: number;
}

export interface RatingsMap {
  [postId: string]: Rating;
}

export async function grade(postId: string, username: string, vote: number) {
  if (!isUuid.anyNonNil(postId)) {
    return;
  }

  let normalisedVote = 0;
  if (vote > 0) {
    normalisedVote = 1;
  } else if (vote < 0) {
    normalisedVote = -1;
  }

  await db.addRating(postId, username, normalisedVote);
}

export async function get(postIds: string[], username?: string): Promise<RatingsMap> {
  const tasks = [];
  tasks.push(db.getRatings(postIds));

  if (username) {
    tasks.push(db.getUserRatings(username, postIds));
  } else {
    tasks.push(null);
  }
  const [ratings, userVotes] = await Promise.all(tasks);

  const ratingsMap: RatingsMap = {};

  for (const postId of postIds) {
    ratingsMap[postId] = { grade: ratings[postId] };

    if (username) {
      ratingsMap[postId].user =  userVotes[postId];
    }
  }

  return ratingsMap;
}

export async function clear() {
  await db.clearRatings();
}
