import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (db) {
    return { client, db };
  }

  const uri = process.env.MONGODB_URI!;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(getDatabaseName());

  return { client, db };
}

// For Mongoose (easier models)
export async function connectToMongoDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Helper to get database name from connection string
export function getDatabaseName(): string {
  const uri = process.env.MONGODB_URI!;
  const dbName = uri.split('/').pop()?.split('?')[0];
  console.log('Using database:', dbName);
  return dbName || 'payboy';
}

// Close connection (useful for testing)
export async function closeMongoDB() {
  if (mongoose.connections[0].readyState) {
    await mongoose.connection.close();
  }
}