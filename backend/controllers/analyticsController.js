import dbConnect from '../config/mongodb.js';
import UrlScan from '../models/UrlScan.js';
import Complaint from '../models/Complaint';

export async function getAnalyticsSummary() {
  await dbConnect();
  const [totalScans, totalComplaints, recentScans] = await Promise.all([
    UrlScan.countDocuments(),
    Complaint.countDocuments(),
    UrlScan.find().sort({ createdAt: -1 }).limit(100).lean()
  ]);

  return {
    totalScans,
    totalComplaints,
    recentScans
  };
}
