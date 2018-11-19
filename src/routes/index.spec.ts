import supertest from 'supertest';
import app from '../app';

describe('routes', () => {
  describe('GET /', () => {
    it('should respond with documentation', async () => {
      const response = await supertest(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        v1: '/v1'
      });
    });
  });

  describe('invalid route', () => {
    it('should respond for 404', async () => {
      const response = await supertest(app).get('/sadjfklasdjf/adsfadsf');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Not found'
      });
    });
  });
});
