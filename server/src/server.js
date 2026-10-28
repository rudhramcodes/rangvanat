import { startReservationExpiry } from './modules/orders/reservations.js';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './database/db.js';

await connectDB();
startReservationExpiry();

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
