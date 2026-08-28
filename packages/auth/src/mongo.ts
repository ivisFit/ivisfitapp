import { MongoClient, type Db } from "mongodb";
import {
  getSharedDb,
  getSharedMongoClient,
  isDbConnected,
  normalizeMongoUri,
} from "@ivisfit/database";

const MONGO_CLIENT_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30_000,
  socketTimeoutMS: 45_000,
  retryWrites: true,
} as const;

function getUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI no está definida en las variables de entorno");
  }

  return normalizeMongoUri(uri);
}

let fallbackClient: MongoClient | null = null;

export function getMongoClient(): MongoClient {
  const sharedClient = getSharedMongoClient();
  if (sharedClient) {
    return sharedClient;
  }

  if (!fallbackClient) {
    fallbackClient = new MongoClient(getUri(), MONGO_CLIENT_OPTIONS);
  }

  return fallbackClient;
}

export function getDb(): Db {
  const sharedDb = getSharedDb();
  if (sharedDb) {
    return sharedDb;
  }

  return getMongoClient().db();
}

/** @deprecated Usar getMongoClient() — mantenido por compatibilidad */
export const mongoClient = {
  connect: async () => {
    if (isDbConnected()) {
      return;
    }

    await getMongoClient().connect();
  },
  db: () => getDb(),
};
