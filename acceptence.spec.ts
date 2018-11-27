import supertest from 'supertest';
import { execSync } from 'child_process';

const HOST = 'http://localhost:2737';

jest.setTimeout(20000);

beforeAll(async () => {
  execSync('docker-compose -f docker-compose.acceptence.yml up -d');

  const start = new Date().getTime();

  // Wait for server to be up
  while (true) {
    try {
      const response = await supertest(HOST).get('/');

      if (response.status === 200) {
        break;
      }
    } catch (e) {}

    // Ignore if it takes this long to start
    if ((new Date().getTime() - start) > 60000) {
      break;
    }

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
