/**
 * Migra la base `ivisfit` del cluster MongoDB anterior al nuevo cluster Atlas.
 * Uso: node apps/backend-api/scripts/migrate-mongo-to-atlas.mjs
 */
import { MongoClient } from "mongodb";

const SOURCE_URI =
  "mongodb://gassjau_db_user:UTStq8IYG2JFhiGU@ac-jhxyu8n-shard-00-00.38a61ql.mongodb.net:27017,ac-jhxyu8n-shard-00-01.38a61ql.mongodb.net:27017,ac-jhxyu8n-shard-00-02.38a61ql.mongodb.net:27017/ivisfit?ssl=true&replicaSet=atlas-4tge2x-shard-0&authSource=admin";

const TARGET_URI =
  "mongodb://redesivis_db_user:0YKn6kp92HwgaTZv@ac-u7tgr3x-shard-00-00.tzemfk2.mongodb.net:27017,ac-u7tgr3x-shard-00-01.tzemfk2.mongodb.net:27017,ac-u7tgr3x-shard-00-02.tzemfk2.mongodb.net:27017/ivisfit?ssl=true&replicaSet=atlas-qtoqby-shard-0&authSource=admin";

const DB_NAME = "ivisfit";
const BATCH_SIZE = 500;

async function copyCollection(sourceDb, targetDb, collectionName) {
  const source = sourceDb.collection(collectionName);
  const target = targetDb.collection(collectionName);

  const existing = await target.countDocuments();
  if (existing > 0) {
    console.log(`  ⏭  ${collectionName}: ya tiene ${existing} docs, se omite`);
    return { name: collectionName, copied: 0, skipped: existing };
  }

  const total = await source.countDocuments();
  if (total === 0) {
    console.log(`  ·  ${collectionName}: vacía`);
    return { name: collectionName, copied: 0, skipped: 0 };
  }

  let copied = 0;
  const cursor = source.find({}).batchSize(BATCH_SIZE);

  while (await cursor.hasNext()) {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE && (await cursor.hasNext()); i++) {
      batch.push(await cursor.next());
    }
    if (batch.length > 0) {
      await target.insertMany(batch, { ordered: false });
      copied += batch.length;
      process.stdout.write(`\r  →  ${collectionName}: ${copied}/${total}`);
    }
  }

  const indexes = await source.indexes();
  for (const index of indexes) {
    if (index.name === "_id_") continue;
    const { key, name, unique, sparse, expireAfterSeconds, partialFilterExpression } =
      index;
    const options = { name };
    if (unique) options.unique = true;
    if (sparse) options.sparse = true;
    if (expireAfterSeconds != null) options.expireAfterSeconds = expireAfterSeconds;
    if (partialFilterExpression) options.partialFilterExpression = partialFilterExpression;
    try {
      await target.createIndex(key, options);
    } catch (err) {
      console.warn(`\n  ⚠  índice ${name} en ${collectionName}: ${err.message}`);
    }
  }

  console.log(`\r  ✓  ${collectionName}: ${copied} docs migrados`);
  return { name: collectionName, copied, skipped: 0 };
}

const sourceClient = new MongoClient(SOURCE_URI, { serverSelectionTimeoutMS: 30000 });
const targetClient = new MongoClient(TARGET_URI, { serverSelectionTimeoutMS: 30000 });

try {
  console.log("Conectando a clusters...");
  await sourceClient.connect();
  await targetClient.connect();
  console.log("Conexión OK\n");

  const sourceDb = sourceClient.db(DB_NAME);
  const targetDb = targetClient.db(DB_NAME);

  const collections = (await sourceDb.listCollections().toArray()).map((c) => c.name);
  console.log(`Migrando ${collections.length} colecciones de "${DB_NAME}"...\n`);

  const results = [];
  for (const name of collections.sort()) {
    results.push(await copyCollection(sourceDb, targetDb, name));
  }

  const totalCopied = results.reduce((sum, r) => sum + r.copied, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  console.log(`\nListo: ${totalCopied} documentos copiados, ${totalSkipped} omitidos (ya existían).`);
} finally {
  await sourceClient.close().catch(() => {});
  await targetClient.close().catch(() => {});
}
