import mongoose from 'mongoose';
import dns from 'dns';

// Set DNS servers to Google and Cloudflare to resolve Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Warning: Failed to set custom DNS servers in Node:', e);
}

// Direct connection string fallback should be provided via environment variable MONGODB_DIRECT_URI or MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_DIRECT_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn('Warning: MONGODB_URI is not defined. Database operations will be disabled.');
    return null;
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
