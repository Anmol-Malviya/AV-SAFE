import dbConnect from '../config/mongodb.js';
import Complaint from '../models/Complaint.js';
import UrlScan from '../models/UrlScan.js';
import { validateComplaintInput, ALLOWED_STATUSES } from '../validators/complaint.js';
import { checkRateLimit } from '../middleware/rateLimit.js';

export function generateComplaintId() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `PG-${year}-${randomPart}`;
}

export async function createComplaint(data, clientIp) {
  const rateCheck = checkRateLimit(clientIp, 10, 60000);
  if (!rateCheck.allowed) {
    return { status: 429, error: 'Too many complaint submissions. Please try again later.' };
  }

  const validation = validateComplaintInput(data);
  if (!validation.valid) {
    return { status: 400, error: validation.error };
  }

  const conn = await dbConnect();
  if (!conn) {
    return { status: 503, error: 'Database service unavailable' };
  }

  const complaintId = generateComplaintId();
  const complaintDoc = new Complaint({
    complaintId,
    ...validation.sanitized,
    clientIp
  });

  await complaintDoc.save();
  return { status: 201, success: true, complaint: complaintDoc };
}

export async function listComplaints(query = {}, page = 1, limit = 20) {
  const conn = await dbConnect();
  if (!conn) {
    return { status: 503, error: 'Database service unavailable' };
  }

  const skip = (page - 1) * limit;
  const [complaints, total] = await Promise.all([
    Complaint.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Complaint.countDocuments(query)
  ]);

  return {
    status: 200,
    complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
