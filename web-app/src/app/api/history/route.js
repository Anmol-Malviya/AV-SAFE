import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UrlScan from '@/lib/models/UrlScan';
import { validateAndNormalizeUrl } from '@/lib/security/urlValidation';
import { requireAuth, requireAdmin } from '@/lib/auth/authMiddleware';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // 1. Authenticate the request
    const auth = await requireAuth(request, { optional: true });

    await dbConnect();

    let query = {};
    if (auth.authenticated && auth.userId) {
      // Authenticated user: read personal scan history isolated to their userId
      // Analysts / Admins can inspect all by passing ?scope=all if permitted
      const { searchParams } = new URL(request.url);
      const scope = searchParams.get('scope');

      if (scope === 'all' && (auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN' || auth.role === 'ANALYST')) {
        query = {};
      } else {
        query = { userId: auth.userId };
      }
    } else {
      // Anonymous / Guest caller: return only anonymous guest records (or empty) to prevent data leak
      query = { userId: null };
    }

    const history = await UrlScan.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Format response to match expected UI structure
    const formatted = history.map((item) => ({
      _id: item._id?.toString(),
      url: item.url,
      rating: item.rating,
      score: item.score,
      source: item.source || "Web Dashboard",
      date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
      createdAt: item.createdAt,
      detectionReasons: item.detectionReasons || [],
      userId: item.userId || null
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('Failed to fetch scan history from database:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 1. Authenticate request (authenticated or supported guest telemetry)
    const auth = await requireAuth(request, { optional: true });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { url, rating, score, detectionReasons, source } = body;

    if (!url || !rating || score === undefined) {
      return NextResponse.json({ error: 'url, rating, and score are required' }, { status: 400 });
    }

    const validUrl = validateAndNormalizeUrl(url);
    if (!validUrl.valid) {
      return NextResponse.json({ error: validUrl.error }, { status: 400 });
    }

    const validRating = ['SAFE', 'SUSPICIOUS', 'DANGEROUS'].includes(String(rating).toUpperCase())
      ? String(rating).toUpperCase()
      : 'SUSPICIOUS';

    const numScore = parseInt(score, 10);
    const validScore = !isNaN(numScore) ? Math.min(100, Math.max(0, numScore)) : 50;
    
    // Normalize source (Android App, Web Dashboard, Browser Extension)
    const validSource = source && typeof source === 'string' && source.trim().length > 0 
      ? source.trim() 
      : 'Web Dashboard';

    await dbConnect();

    // Isolated Upsert: User-owned scans are isolated per (userId, url)
    // Never trust frontend-supplied userId; extract strictly from verified auth token
    const effectiveUserId = auth.authenticated && auth.userId ? auth.userId : null;

    const filter = {
      url: validUrl.originalUrl,
      userId: effectiveUserId
    };

    const newScan = await UrlScan.findOneAndUpdate(
      filter,
      {
        $set: {
          url: validUrl.originalUrl,
          rating: validRating,
          score: validScore,
          source: validSource,
          detectionReasons: Array.isArray(detectionReasons) ? detectionReasons : [],
          date: new Date().toLocaleDateString(),
          createdAt: new Date(),
          userId: effectiveUserId,
          ownerUserId: effectiveUserId
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      _id: newScan._id?.toString(),
      url: newScan.url,
      rating: newScan.rating,
      score: newScan.score,
      source: newScan.source,
      date: newScan.date,
      detectionReasons: newScan.detectionReasons,
      userId: newScan.userId
    }, { status: 201 });
  } catch (err) {
    console.error('Failed to save scan record to database:', err);
    return NextResponse.json({ error: 'Failed to record scan' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // Admin only operation
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error || 'Administrative privileges required to purge scan records' },
        { status: adminCheck.status || 403 }
      );
    }

    await dbConnect();
    await UrlScan.deleteMany({});
    return NextResponse.json({ message: 'Scan history purged successfully by administrator' });
  } catch (err) {
    console.error('Failed to clear scan history:', err);
    return NextResponse.json({ error: 'Failed to clear scan history' }, { status: 500 });
  }
}
