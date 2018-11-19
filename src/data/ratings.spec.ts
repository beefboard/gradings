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
  describe('grade', () => {
    it('should add a vote from the given user to the given post id', async () => {
      const postId = uuid.v1();
      await ratings.grade(postId, 'username', 1);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(1);
    });

    it('should allow negitive voting', async () => {
      const postId = uuid.v1();
      await ratings.grade(postId, 'username', -1);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(-1);
    });

    it('should normalise values to 1 point', async () => {
      const postId = uuid.v1();
      await ratings.grade(postId, 'username', 34);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(1);

      const postId2 = uuid.v1();
      await ratings.grade(postId2, 'username', -34);

      const votes2 = await ratings.get([postId2]);

      expect(votes2[postId2].grade).toBe(-1);
    });

    it('ignores non uuid postIds', async () => {
      const postId = 'sdfasdf';
      await ratings.grade(postId, 'username', 1);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(0);
    });

    it('should rate posts individually', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();

      await ratings.grade(postId, 'username', 1);
      await ratings.grade(postId2, 'username', -1);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(1);

      const votes2 = await ratings.get([postId2]);
      expect(votes2[postId2].grade).toBe(-1);
    });

    it('should only count the latest vote per user for the same post', async () => {
      const postId = uuid.v1();
      await ratings.grade(postId, 'username', 34);

      const votes = await ratings.get([postId]);

      expect(votes[postId].grade).toBe(1);

      await ratings.grade(postId, 'username', -34);

      const votes2 = await ratings.get([postId]);

      expect(votes2[postId].grade).toBe(-1);
    });
  });

  describe('get', () => {
    it('should return the votes on the given posts', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.grade(postId, 'username', 1);
      await ratings.grade(postId2, 'username', -1);

      const votes = await ratings.get([postId, postId2]);

      expect(votes).toEqual({
        [postId]: { grade: 1 },
        [postId2]: { grade: -1 }
      });
    });

    it('should return 0 for posts without any votes', async () => {
      const votes = await ratings.get(['sadfkasdfjsda']);

      expect(votes['sadfkasdfjsda'].grade).toBe(0);
    });

    it('should return how a user has voted on the given posts', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.grade(postId, 'auser', -1);
      await ratings.grade(postId2, 'auser', 1);

      const userVotes = await ratings.get([postId, postId2], 'auser');

      expect(userVotes).toEqual({
        [postId]: { grade: -1, auser: -1 },
        [postId2]: { grade: 1, auser: 1 }
      });
    });

    it('should be unque for different users', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      await ratings.grade(postId, 'username', -1);
      await ratings.grade(postId2, 'username', 1);
      await ratings.grade(postId, 'username2', 1);
      await ratings.grade(postId2, 'username2', -1);

      const userVotes = await ratings.get([postId, postId2], 'username');

      expect(userVotes).toEqual({
        [postId]: { grade: 0, username: -1 },
        [postId2]: { grade: 0, username: 1 }
      });

      const userVotes2 = await ratings.get([postId, postId2], 'username2');

      expect(userVotes2).toEqual({
        [postId]: { grade: 0, username2: 1 },
        [postId2]: { grade: 0, username2: -1 }
      });
    });

    it('should return 0 for posts a user has not voted on', async () => {
      const postId = uuid.v1();
      const postId2 = uuid.v1();
      const userVotes = await ratings.get([postId, postId2], 'username');

      expect(userVotes).toEqual({
        [postId]: { grade: 0, username: 0 },
        [postId2]: { grade: 0, username: 0 }
      });
    });
  });
});
