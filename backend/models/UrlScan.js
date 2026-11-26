import mongoose from 'mongoose';

const UrlScanSchema = new mongoose.Schema({
  url: { type: String, required: true, index: true },
  rating: { type: String, required: true },
  score: { type: Number, required: true },
  source: { type: String, default: 'ANDROID_BROWSER' },
  detectionReasons: { type: [String], default: [] },
  date: { type: String, default: () => new Date().toLocaleDateString() },
  createdAt: { type: Date, default: Date.now, index: true }
});

UrlScanSchema.index({ createdAt: -1 });
UrlScanSchema.index({ url: 1, createdAt: -1 });

export default mongoose.models.UrlScan || mongoose.model('UrlScan', UrlScanSchema);
