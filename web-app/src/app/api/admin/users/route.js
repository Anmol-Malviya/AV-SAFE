import { NextResponse } from 'next/server';
import { requireAdminOrApiKey, SUPER_ADMIN_EMAIL } from '@/lib/auth/adminGuard';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '../../../../../../backend/config/mongodb.js';
import User from '../../../../../../backend/models/User.js';

// Fallback dummy user dataset when MongoDB is disconnected/offline
const MOCK_USERS = [
  {
    _id: "usr_mock_001",
    clerkUserId: "user_2tm8A9Z1kL0SuperAdmin",
    email: "anmoldiscord4328@gmail.com",
    firstName: "Anmol",
    lastName: "Malviya",
    imageUrl: "",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    _id: "usr_mock_002",
    clerkUserId: "user_2tm8B8Y2jM1SecOps",
    email: "secops-triage@avsafe.internal",
    firstName: "SecOps",
    lastName: "Lead",
    imageUrl: "",
    role: "ADMIN",
    status: "ACTIVE",
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    _id: "usr_mock_003",
    clerkUserId: "user_2tm8C7X3kN2Analyst",
    email: "analyst.dev@avsafe.internal",
    firstName: "Threat",
    lastName: "Hunter",
    imageUrl: "",
    role: "ANALYST",
    status: "ACTIVE",
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    _id: "usr_mock_004",
    clerkUserId: "user_2tm8D6W4lO3Suspended",
    email: "bot-flagged@attacker-phish.net",
    firstName: "Suspicious",
    lastName: "Actor",
    imageUrl: "",
    role: "USER",
    status: "SUSPENDED",
    lastLoginAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  }
];

export async function GET(request) {
  let isAuthorized = false;
  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      isAuthorized = true;
    }
  } catch {
    // ignore
  }

  if (!isAuthorized) {
    const auth = await requireAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') || 'ALL';
  const status = searchParams.get('status') || 'ALL';

  try {
    let connected = false;
    try {
      await dbConnect();
      connected = true;
    } catch {
      connected = false;
    }

    if (connected) {
      const query = {};
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }
      if (role !== 'ALL') query.role = role;
      if (status !== 'ALL') query.status = status;

      const users = await User.find(query).sort({ lastLoginAt: -1 }).limit(100).lean();
      return NextResponse.json({
        success: true,
        source: 'database',
        users
      });
    }

    // Mock filtering fallback
    let filtered = [...MOCK_USERS];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u => u.email.toLowerCase().includes(q) || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q));
    }
    if (role !== 'ALL') filtered = filtered.filter(u => u.role === role);
    if (status !== 'ALL') filtered = filtered.filter(u => u.status === status);

    return NextResponse.json({
      success: true,
      source: 'offline-memory',
      users: filtered
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  let isAuthorized = false;
  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      isAuthorized = true;
    }
  } catch {
    // ignore
  }

  if (!isAuthorized) {
    const auth = await requireAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  }

  try {
    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
      await dbConnect();
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(role && { role }),
          ...(status && { status })
        },
        { new: true }
      );
      if (updatedUser) {
        return NextResponse.json({ success: true, user: updatedUser });
      }
    } catch {
      // Offline fallback handling
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} updated to role:${role} status:${status} (mock ack)`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
