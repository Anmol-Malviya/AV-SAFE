import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import { requireRole } from '@/lib/auth/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await requireRole(request, 'ANALYST');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Analyst or Administrative privileges required' },
        { status: auth.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    await dbConnect();

    const query = {};
    if (status && ['REGISTERED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) {
      query.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(query)
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error querying complaints in admin endpoint:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireRole(request, 'ANALYST');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Analyst or Administrative privileges required' },
        { status: auth.status || 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { complaintId, status, adminNotes } = body;
    if (!complaintId) {
      return NextResponse.json({ error: 'complaintId is required' }, { status: 400 });
    }

    if (!status || !['REGISTERED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();

    const updateData = { status };
    if (typeof adminNotes === 'string') {
      updateData.adminNotes = adminNotes;
    }

    const updated = await Complaint.findOneAndUpdate(
      { complaintId },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (err) {
    console.error('Error updating complaint status in admin endpoint:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
