import * as db from './db/db';
import isUuid from 'is-uuid';

export interface RatingsMap {
  [postId: string]: number;
}

export async function vote(postId: string, username: string, vote: number) {
  if (!isUuid.anyNonNil(postId)) {
    return;
  }

  const normalisedVote = vote > 0 ? 1 : -1;

  await db.addRating(postId, username, normalisedVote);
}

export async function get(postIds: string[]): Promise<RatingsMap> {
  const ratings = await Promise.all(postIds.map((postId: string) => db.getRating(postId)));
  const ratingsMap: RatingsMap = {};

  for (let i = 0; i < postIds.length; i += 1) {
    ratingsMap[postIds[i]] = ratings[i];
  }

  return ratingsMap;
}

export async function getUserVotes(username: string, postIds: string[]) {
  return await db.getUserRatings(username, postIds);
}

export async function clear() {
  await db.clearRatings();
}
