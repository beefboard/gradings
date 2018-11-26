import supertest from 'supertest';
import { execSync } from 'child_process';

const HOST = 'http://localhost:2737';

jest.setTimeout(10000);

beforeAll((done) => {
  execSync('docker-compose -f docker-compose.acceptence.yml up -d');

  // Wait for server to be up
  setTimeout(done, 5000);
});

afterAll(() => {
  try {
    execSync('docker-compose -f docker-compose.acceptence.yml down');
  } catch (_) {}
});

describe('acceptence', () => {
  it('responds on port', async () => {
    const response = await supertest(HOST).get('/');
    expect(response.status).toBe(200);
  });
});
