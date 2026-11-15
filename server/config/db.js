import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.info('MongoDB connected.');
}
