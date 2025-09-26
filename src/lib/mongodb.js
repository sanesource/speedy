import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "speedy";

let cachedClient = global.__SPEEDY_MONGO_CLIENT ?? null;
let cachedDb = global.__SPEEDY_MONGO_DB ?? null;
let connectionWarningLogged = false;

export async function getMongoClient() {
  if (!uri) {
    return null;
  }

  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    cachedClient = await client.connect();
  } catch (error) {
    cachedClient = null;
    if (!connectionWarningLogged) {
      console.warn(
        "[speedy] MongoDB connection failed. Falling back to in-memory storage.",
        error.message
      );
      connectionWarningLogged = true;
    }
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    global.__SPEEDY_MONGO_CLIENT = cachedClient;
  }

  return cachedClient;
}

export async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await getMongoClient();
  if (!client) {
    return null;
  }

  cachedDb = client.db(dbName);

  if (process.env.NODE_ENV === "development") {
    global.__SPEEDY_MONGO_DB = cachedDb;
  }

  return cachedDb;
}

export function isMongoConfigured() {
  return Boolean(uri);
}

export async function withDb(callback) {
  const db = await getDb();
  return callback(db);
}
