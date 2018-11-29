import supertest from 'supertest';
import app from '../../app';

const ratings = require('../../data/ratings');
jest.mock('../../data/ratings');

console.error = () => {};

describe('/v1/grades', () => {
  describe('GET /', () => {
    it('should respond with votes of given posts', async () => {
      const posts = ['sadfasdf', 'sadfsadfdf'];

      ratings.get.mockImplementation(() => {
        return {
          sadfasdf: { grade: 6 },
          sadfsadfdf: { grade: 4 }
        };
      });

      const response = await supertest(app)
        .get('/v1/grades')
        .query({
          posts: posts
        });

      expect(ratings.get).toHaveBeenCalledWith(posts, undefined);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sadfasdf: { grade: 6 },
        sadfsadfdf: { grade: 4 }
      });
    });

    it('should respond with users votes when user given', async () => {
      const posts = ['sadfasdf', 'sadfsadfdf'];
      const user = 'username';

      ratings.get.mockImplementation(() => {
        return {
          sadfasdf: { grade: 6, user: 0 },
          sadfsadfdf: { grade: 4, user: 1 }
        };
      });

      const response = await supertest(app)
        .get('/v1/grades')
        .query({
          posts: posts,
          user: user
        });

      expect(ratings.get).toHaveBeenCalledWith(posts, user);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sadfasdf: { grade: 6, user: 0 },
        sadfsadfdf: { grade: 4, user: 1 }
      });
    });

    it('should return 422 if posts is not an array', async () => {
      const post = 'sadfasdf';
      const response = await supertest(app)
        .get('/v1/grades')
        .query({
          posts: post
        });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'Posts must be an array'
      });
    });

    it('should respond 500 on db error', async () => {
      const posts = ['sadfasdf', 'sadfsadfdf'];

      ratings.get.mockImplementation(() => {
        throw new Error('Some error');
      });

      const response = await supertest(app)
        .get('/v1/grades')
        .query({
          posts: posts
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /:postId', () => {
    it('should respond with votes for post', async () => {
      const post = 'asdsd';

      ratings.get.mockImplementation(() => {
        return {
          [post]: { grade: 23 }
        };
      });

      const response = await supertest(app).get(`/v1/grades/${post}`);

      expect(ratings.get).toHaveBeenCalledWith([post], undefined);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ grade: 23 });
    });

    it('should respond with user votes if user given', async () => {
      const post = 'asdsd';
      const user = 'sadfasdf';

      ratings.get.mockImplementation(() => {
        return {
          [post]: { grade: 23 }
        };
      });

      const response = await supertest(app).get(`/v1/grades/${post}`).query({
        user: user
      });

      expect(ratings.get).toHaveBeenCalledWith([post], user);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ grade: 23 });
    });

    it('should respond 500 on db error', async () => {
      const post = 'asdsd';
      ratings.get.mockImplementation(() => {
        throw new Error('An error');
      });

      const response = await supertest(app).get(`/v1/grades/${post}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });

  describe('PUT /:postId', () => {
    it('should vote on the given post id with the given vote for the given user', async () => {
      const post = 'oijdsfasdf';
      const user = 'jasdhfkjsd';

      const response = await supertest(app).put(`/v1/grades/${post}`).send({
        user: user,
        grade: -1
      });

      expect(ratings.grade).toHaveBeenCalledWith(post, user, -1);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true
      });
    });

    it('should respond 422 when user not given', async () => {
      const response = await supertest(app).put('/v1/grades/sadasd').send({
        vote: -1
      });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'User and vote must be given'
      });
    });

    it('should respond with 422 when vote not given', async () => {
      const response = await supertest(app).put('/v1/grades/sadasd').send({
        user: 'asdasd'
      });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'User and vote must be given'
      });
    });

    it('should respond with 500 on db error', async () => {
      ratings.grade.mockImplementation(() => {
        throw new Error('Another error');
      });

      const response = await supertest(app).put('/v1/grades/sadasd').send({
        user: 'asdasd',
        grade: -1
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error'
      });
    });
  });
});
