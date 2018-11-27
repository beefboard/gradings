import supertest from 'supertest';
import { execSync } from 'child_process';

const HOST = process.env.DOCKER_HOST || 'http://localhost:2737';

jest.setTimeout(60000);

beforeAll(async () => {
  execSync('docker-compose -f docker-compose.acceptence.yml up -d');

  // Wait for server to be up
  while (true) {
    try {
      const response = await supertest(HOST).get('/');

      if (response.status === 200) {
        break;
      }
    } catch (e) {}

    await new Promise((resolve) => {
      return setTimeout(resolve, 200);
    });
  }
});

afterAll(() => {
  try {
    execSync('docker-compose -f docker-compose.acceptence.yml down');
  } catch (_) {}
});

describe('acceptence', () => {
  it('responds', async () => {
    const response = await supertest(HOST).get('/');
    expect(response.status).toBe(200);
  });
});
