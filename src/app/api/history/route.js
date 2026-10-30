import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import UrlScan from '../../../lib/models/UrlScan';
import { validateAndNormalizeUrl } from '@/lib/security/urlValidation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const history = await UrlScan.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Format response to match expected UI structure with real timestamps
    const formatted = history.map((item) => ({
      _id: item._id?.toString(),
      url: item.url,
      rating: item.rating,
      score: item.score,
      source: item.source || 'ANDROID_BROWSER',
      date: item.date || new Date(item.createdAt).toLocaleDateString(),
      createdAt: item.createdAt,
      detectionReasons: item.detectionReasons || []
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('Failed to fetch scan history from database:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
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

    await dbConnect();

    // Safely delete previous duplicate scan for this URL so latest status is at top
    await UrlScan.deleteMany({ url: validUrl.originalUrl });

    const newScan = await UrlScan.create({
      url: validUrl.originalUrl,
      rating: validRating,
      score: validScore,
      source: source || 'WEB_SCANNER',
      detectionReasons: Array.isArray(detectionReasons) ? detectionReasons : [],
      date: new Date().toLocaleDateString(),
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, data: newScan });
  } catch (err) {
    console.error('Failed to save scan result to database:', err);
    return NextResponse.json({ error: 'Failed to save scan result' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await UrlScan.deleteMany({});
    return NextResponse.json({ success: true, message: 'Scan history cleared successfully from database' });
  } catch (err) {
    console.error('Failed to clear scan history:', err);
    return NextResponse.json({ error: 'Failed to clear scan history' }, { status: 500 });
  }
}
