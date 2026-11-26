import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import { requireRole } from '@/lib/auth/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const auth = await requireRole(request, 'ANALYST');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Analyst or Administrative privileges required' },
        { status: auth.status || 403 }
      );
    }

    const { complaintId } = await params;
    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    await dbConnect();
    const item = await Complaint.findOne({ complaintId }).lean();
    if (!item) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching admin complaint details:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await requireRole(request, 'ANALYST');
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Analyst or Administrative privileges required' },
        { status: auth.status || 403 }
      );
    }

    const { complaintId } = await params;
    if (!complaintId) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { status, adminNotes } = body;
    const updateData = {};

    if (status) {
      if (!['REGISTERED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (typeof adminNotes === 'string') {
      updateData.adminNotes = adminNotes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    await dbConnect();
    const updated = await Complaint.findOneAndUpdate(
      { complaintId },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating admin complaint:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
