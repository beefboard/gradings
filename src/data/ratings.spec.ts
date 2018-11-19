import * as ratings from './ratings';
import * as db from './db/db';
import * as uuid from 'uuid';

beforeAll(async () => {
  await db.initDb();
});

afterEach(async () => {
  await ratings.clear();
});

describe('ratings', () => {
  describe('vote', () => {
    it('should add a vote from the given user to the given post id', async () => {
      const postId = uuid.v1();
      await ratings.vote(postId, 'username', 1);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(1);
    });

    it('should allow negitive voting', async () => {
      const postId = uuid.v1();
      await ratings.vote(postId, 'username', -1);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(-1);
    });

    it('should normalise values to 1 point', async () => {
      const postId = uuid.v1();
      await ratings.vote(postId, 'username', 34);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(1);

      const postId2 = uuid.v1();
      await ratings.vote(postId2, 'username', -34);

      const votes2 = await ratings.get([postId2]);

      expect(votes2[postId2]).toBe(-1);
    });

    it('ignores non uuid postIds', async () => {
      const postId = 'sdfasdf';
      await ratings.vote(postId, 'username', 1);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(0);
    });

    it('should rate posts individually', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();

      await ratings.vote(postId, 'username', 1);
      await ratings.vote(postId2, 'username', -1);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(1);

      const votes2 = await ratings.get([postId2]);
      expect(votes2[postId2]).toBe(-1);
    });

    it('should only count the latest vote per user for the same post', async () => {
      const postId = uuid.v1();
      await ratings.vote(postId, 'username', 34);

      const votes = await ratings.get([postId]);

      expect(votes[postId]).toBe(1);

      await ratings.vote(postId, 'username', -34);

      const votes2 = await ratings.get([postId]);

      expect(votes2[postId]).toBe(-1);
    });
  });

  describe('get', () => {
    it('should return the votes on the given posts', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.vote(postId, 'username', 1);
      await ratings.vote(postId2, 'username', -1);

      const votes = await ratings.get([postId, postId2]);

      expect(votes).toEqual({
        [postId]: 1,
        [postId2]: -1
      });
    });

    it('should return 0 for posts without any votes', async () => {
      const votes = await ratings.get(['sadfkasdfjsda']);

      expect(votes['sadfkasdfjsda']).toBe(0);
    });
  });

  describe('getUserVotes', () => {
    it('should return how a user has voted on the given posts', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.vote(postId, 'username', -1);
      await ratings.vote(postId2, 'username', 1);

      const userVotes = await ratings.getUserVotes('username', [postId, postId2]);

      expect(userVotes).toEqual({
        [postId]: -1,
        [postId2]: 1
      });
    });

    it('should be unque for different users', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.vote(postId, 'username', -1);
      await ratings.vote(postId2, 'username', 1);
      await ratings.vote(postId, 'username2', 1);
      await ratings.vote(postId2, 'username2', -1);

      const userVotes = await ratings.getUserVotes('username', [postId, postId2]);

      expect(userVotes).toEqual({
        [postId]: -1,
        [postId2]: 1
      });

      const userVotes2 = await ratings.getUserVotes('username2', [postId, postId2]);

      expect(userVotes2).toEqual({
        [postId]: 1,
        [postId2]: -1
      });
    });

    it('should return 0 for posts a user has not voted on', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      const userVotes = await ratings.getUserVotes('username', [postId, postId2]);

      expect(userVotes).toEqual({
        [postId]: 0,
        [postId2]: 0
      });
    });
  });
});
