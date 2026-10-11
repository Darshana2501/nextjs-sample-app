import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL;

let clientPromise;

// Import vela throw kela tar build fail hoto, mhanun request vela error dyaycha
if (!uri) {
  clientPromise = Promise.reject(new Error("MONGODB_URL is missing"));
  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;
