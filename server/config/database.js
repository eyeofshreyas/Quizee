import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error(`DB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;