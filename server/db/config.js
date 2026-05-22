import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;
  let usingMemoryServer = false;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Failed to connect to MongoDB at ${mongoUri}: ${error.message}`);
    console.warn('Starting in-memory MongoDB fallback for local development...');

    try {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      usingMemoryServer = true;
      const conn = await mongoose.connect(mongoUri);
      console.log('MongoDB Connected: In-memory MongoDB server');
    } catch (fallbackError) {
      console.error(`Error connecting to in-memory MongoDB: ${fallbackError.message}`);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

export default connectDB;
