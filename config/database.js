import { MongoClient } from "mongodb";

let client = null;

/**
 * Get MongoDB collection instance
 * Uses singleton pattern to maintain a single connection
 * @returns {Promise<Collection>} MongoDB collection
 */
export async function getCollection() {
  if (!client) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is required");
    }

    client = new MongoClient(mongoUri);
    await client.connect();
  }

  const dbName = process.env.DB_NAME || "skyPrice";
  const collectionName = process.env.COLLECTION || "flight_alerts";

  return client.db(dbName).collection(collectionName);
}

/**
 * Close MongoDB connection
 * Useful for graceful shutdown
 */
export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
  }
}

