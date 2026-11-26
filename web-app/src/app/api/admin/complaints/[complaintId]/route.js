import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Complaint from '@/lib/models/Complaint';
import { verifyAdminAuth } from '@/lib/auth/requireAdmin';
import { ALLOWED_STATUSES } from '@/lib/validation/complaint';

export async function GET(request, { params }) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { complaintId } = await params;
    if (!complaintId) {
      return NextResponse.json({ error: 'Missing complaintId' }, { status: 400 });
    }

    await dbConnect();
    const item = await Complaint.findOne({ complaintId }).lean();
    if (!item) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error('Error fetching complaint detail:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { complaintId } = await params;
    if (!complaintId) {
      return NextResponse.json({ error: 'Missing complaintId' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { status, adminNotes } = body;
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

    return NextResponse.json({ success: true, data: updated, message: 'Updated successfully' });
  } catch (err) {
    console.error('Error updating complaint detail:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

