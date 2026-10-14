import { MongoClient } from "mongodb";

// Vercel madhe value paste kartana quotes/spaces yetat, te kadhun takaycha
const uri = process.env.MONGODB_URL?.trim().replace(/^["']|["']$/g, "").trim();

// Import vela throw kela tar build fail hoto, mhanun error promise madhe thevaycha
// ani request vela (await clientPromise) dyaycha
function connect() {
  let promise;
  try {
    if (!uri) throw new Error("MONGODB_URL is missing");
    if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
      throw new Error(
        `MONGODB_URL must start with mongodb:// or mongodb+srv:// (got "${uri.slice(0, 12)}...")`
      );
    }
    promise = new MongoClient(uri).connect();
  } catch (error) {
    promise = Promise.reject(error);
  }
  promise.catch(() => {});
  return promise;
}

let clientPromise;

// Dev madhe hot-reload la navin client banu naye mhanun global madhe cache
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connect();
}

export default clientPromise;
