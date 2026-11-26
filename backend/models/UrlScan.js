import mongoose from 'mongoose';

const UrlScanSchema = new mongoose.Schema({
  url: { type: String, required: true, index: true },
  rating: { type: String, required: true },
  score: { type: Number, required: true },
  source: { type: String, default: 'ANDROID_BROWSER' },
  detectionReasons: { type: [String], default: [] },
  date: { type: String, default: () => new Date().toLocaleDateString() },
  createdAt: { type: Date, default: Date.now, index: true },
  // User identity ownership: null for anonymous/guest scans
  userId: { type: String, default: null, index: true },
  ownerUserId: { type: String, default: null, index: true }
});

UrlScanSchema.index({ createdAt: -1 });
UrlScanSchema.index({ url: 1, createdAt: -1 });
// Compound index for user history queries
UrlScanSchema.index({ userId: 1, createdAt: -1 });
UrlScanSchema.index({ userId: 1, url: 1 });

export default mongoose.models.UrlScan || mongoose.model('UrlScan', UrlScanSchema);
