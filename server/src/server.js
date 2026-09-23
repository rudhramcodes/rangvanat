import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './database/db.js';

await connectDB();

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
