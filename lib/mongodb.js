import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URL;

if (!uri) {
  throw new Error("MONGODB_URL is not defined");
}

const client = new MongoClient(url);

export async function connectDB() {
  await client.connect();
  return client;
}

export default client;