import app from './app';
import { env } from './infrastructure/database/env';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SpaBar API running at http://localhost:${env.PORT}/api/v1`);
});
