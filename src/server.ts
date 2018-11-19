import 'source-map-support/register';

import app from './app';
import { initDb } from './data/db/db';

const port = process.env.PORT || 2737;

(async () => {
  try {
    await initDb();
  } catch (e) {
    console.error(`Could not initialise db: ${e}`);
  }

  app.listen(port, () => {
    console.log(`Gradings listening on ${port}`);
  });
})();
