import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers to Google and Cloudflare to resolve Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Warning: Failed to set custom DNS servers in Node:', e);
}

// Direct connection string to bypass Windows querySrv DNS issues
const DIRECT_MONGODB_URI = 'mongodb://gaming182006:tanay1826@cluster0-shard-00-00.g7yen.mongodb.net:27017,cluster0-shard-00-01.g7yen.mongodb.net:27017,cluster0-shard-00-02.g7yen.mongodb.net:27017/phishguard?ssl=true&authSource=admin&retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI?.includes('mongodb+srv') ? DIRECT_MONGODB_URI : (process.env.MONGODB_URI || DIRECT_MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
