import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import { verifyAdminAuth } from '@/lib/auth/requireAdmin';
import { ALLOWED_STATUSES } from '@/lib/validation/complaint';

export async function GET(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const verdict = searchParams.get('verdict');
    const search = searchParams.get('search');

    await dbConnect();

    const query = {};

    if (status && status !== 'ALL' && ALLOWED_STATUSES.includes(status)) {
      query.status = status;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (verdict && verdict !== 'ALL') {
      query.detectionVerdict = verdict;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.$or = [
        { complaintId: { $regex: cleanSearch, $options: 'i' } },
        { hostname: { $regex: cleanSearch, $options: 'i' } },
        { originalUrl: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Summary stats
    const [totalReports, newlyRegistered, underReview, resolved, dangerous] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: 'REGISTERED' }),
      Complaint.countDocuments({ status: 'UNDER_REVIEW' }),
      Complaint.countDocuments({ status: 'RESOLVED' }),
      Complaint.countDocuments({ detectionVerdict: { $in: ['DANGEROUS', 'SUSPICIOUS'] } })
    ]);

    return NextResponse.json({
      success: true,
      data: complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: totalReports,
        registered: newlyRegistered,
        underReview,
        resolved,
        dangerous
      }
    });
  } catch (err) {
    console.error('Admin API GET complaints error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { complaintId, status, adminNotes } = body;
    if (!complaintId) {
      return NextResponse.json({ error: 'complaintId is required' }, { status: 400 });
    }

    const updateFields = {};

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
      }
      updateFields.status = status;
    }

    if (adminNotes !== undefined) {
      if (typeof adminNotes !== 'string') {
        return NextResponse.json({ error: 'adminNotes must be a string' }, { status: 400 });
      }
      updateFields.adminNotes = adminNotes.trim().slice(0, 3000);
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    await dbConnect();

    const updated = await Complaint.findOneAndUpdate(
      { complaintId },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Complaint updated successfully.'
    });
  } catch (err) {
    console.error('Admin API PATCH complaints error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

