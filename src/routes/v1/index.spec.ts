import supertest from 'supertest';
import app from '../../app';

describe('/v1', () => {
  describe('GET /', () => {
    it('should respond with documentation', async () => {
      const response = await supertest(app).get('/v1');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        grades: '/grades'
      });
    });
  });
});
