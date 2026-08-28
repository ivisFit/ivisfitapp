import mongoose from "mongoose";
import type { Db, MongoClient } from "mongodb";

const MONGO_CLIENT_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30_000,
  socketTimeoutMS: 45_000,
  retryWrites: true,
} as const;

/** Corrige URIs donde el nombre de la DB quedó pegado a appName (ej. appName=Cluster/ivisfit). */
export function normalizeMongoUri(uri: string): string {
  const configuredDb = process.env.MONGODB_DB_NAME?.trim();
  const appNameWithDb = uri.match(/appName=([^&]+)\/([^&\s]+)/);
  const dbName = configuredDb || appNameWithDb?.[2];

  if (!dbName) return uri;

  if (appNameWithDb) {
    const [, appName, embeddedDb] = appNameWithDb;
    const hasDbInPath = /mongodb(?:\+srv)?:\/\/[^?]+@[^/]+\/[^/?]+/.test(uri);

    if (hasDbInPath) {
      return uri.replace(`appName=${appName}/${embeddedDb}`, `appName=${appName}`);
    }

    return uri
      .replace(`appName=${appName}/${embeddedDb}`, `appName=${appName}`)
      .replace(/(\.mongodb\.net(?::\d+)?)\/\?/, `$1/${dbName}?`);
  }

  if (configuredDb && /(\.mongodb\.net(?::\d+)?)\/\?/.test(uri)) {
    return uri.replace(/(\.mongodb\.net(?::\d+)?)\/\?/, `$1/${configuredDb}?`);
  }

  return uri;
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getSharedMongoClient(): MongoClient | null {
  if (!isDbConnected()) {
    return null;
  }

  return mongoose.connection.getClient();
}

export function getSharedDb(): Db | null {
  if (!isDbConnected() || !mongoose.connection.db) {
    return null;
  }

  return mongoose.connection.db;
}

let connectPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    throw new Error("MONGODB_URI no está definida en las variables de entorno");
  }

  const uri = normalizeMongoUri(rawUri);

  if (isDbConnected()) {
    return;
  }

  if (!connectPromise) {
    connectPromise = mongoose
      .connect(uri, MONGO_CLIENT_OPTIONS)
      .then((connection) => {
        console.log("MongoDB conectado");
        return connection;
      })
      .catch((error) => {
        connectPromise = null;
        throw error;
      });
  }

  await connectPromise;
}
