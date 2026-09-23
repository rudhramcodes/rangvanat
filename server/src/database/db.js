import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Database Connected');
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
};
