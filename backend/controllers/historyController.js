import dbConnect from '../config/mongodb.js';
import UrlScan from '../models/UrlScan.js';

export async function getRecentScans(limit = 100) {
  await dbConnect();
  const history = await UrlScan.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return history.map((item) => ({
    _id: item._id?.toString(),
    url: item.url,
    rating: item.rating,
    score: item.score,
    source: item.source || "Web Dashboard",
    date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
    createdAt: item.createdAt,
    detectionReasons: item.detectionReasons || []
  }));
}

export async function recordScan(data) {
  await dbConnect();
  const record = new UrlScan(data);
  await record.save();
  return record;
}
