import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import { validateComplaintInput } from '@/lib/validation/complaint';
import { checkRateLimit } from '@/lib/security/rateLimit';

// Generates collision-resistant human readable ID e.g. "PG-2026-000123"
function generateComplaintId() {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `PG-${year}-${randomPart}`;
}

// Client IP extractor from headers
function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // Rate Limiting: Max 15 complaints per IP per 5 minutes
    const limit = checkRateLimit(`complaint_${clientIp}`, 15, 5 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few minutes before submitting another report.' },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = validateComplaintInput(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await dbConnect();

    // Idempotency check: If an idempotency key was provided, prevent duplicate creation
    if (validation.data.idempotencyKey) {
      const existing = await Complaint.findOne({ idempotencyKey: validation.data.idempotencyKey }).lean();
      if (existing) {
        return NextResponse.json({
          success: true,
          complaintId: existing.complaintId,
          status: existing.status,
          message: 'Report previously received and registered (idempotent submission).'
        }, { status: 200 });
      }
    }

    // Also deduplicate if same IP submits the exact same URL within 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentDuplicate = await Complaint.findOne({
      clientIp,
      normalizedUrl: validation.data.normalizedUrl,
      createdAt: { $gte: twoMinutesAgo }
    }).lean();

    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        complaintId: recentDuplicate.complaintId,
        status: recentDuplicate.status,
        message: 'A complaint for this link was recently recorded.'
      }, { status: 200 });
    }

    let complaintId = generateComplaintId();
    // Ensure uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const collision = await Complaint.findOne({ complaintId }).lean();
      if (!collision) break;
      complaintId = generateComplaintId();
      attempts++;
    }

    const newRecord = await Complaint.create({
      ...validation.data,
      complaintId,
      clientIp
    });

    return NextResponse.json(
      {
        success: true,
        complaintId: newRecord.complaintId,
        status: newRecord.status,
        message: 'Complaint submitted successfully and queued for security review.'
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error submitting complaint:', err);
    return NextResponse.json({ error: 'Internal server error while processing complaint' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get('id');

    await dbConnect();

    // Public lookup for status of a specific complaint by complaintId only
    if (complaintId) {
      const complaint = await Complaint.findOne({ complaintId }).select('-adminNotes -clientIp').lean();
      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: complaint });
    }

    // Guest reporting: collection list without admin auth is prohibited
    return NextResponse.json(
      {
        error: 'Unauthorized. Use /api/admin/complaints with administrative credentials to query reports.'
      },
      { status: 401 }
    );
  } catch (err) {
    console.error('Error querying complaint:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

