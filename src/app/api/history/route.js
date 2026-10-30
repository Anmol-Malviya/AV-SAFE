import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import UrlScan from '../../../lib/models/UrlScan';
import { validateAndNormalizeUrl } from '@/lib/security/urlValidation';

const DEFAULT_HISTORY = [
  { url: "https://example.com", rating: "SAFE", score: 98, date: "Today" },
  { url: "http://secure-login-update.com", rating: "SUSPICIOUS", score: 48, date: "Today" },
  { url: "https://github.com", rating: "SAFE", score: 100, date: "Today" },
  { url: "http://paypal-account-verifiy.net", rating: "DANGEROUS", score: 12, date: "Today" },
  { url: "https://google.com", rating: "SAFE", score: 100, date: "Yesterday" },
  { url: "https://portal-login-auth.com", rating: "DANGEROUS", score: 15, date: "Yesterday" },
  { url: "https://microsoft.com", rating: "SAFE", score: 100, date: "Yesterday" },
  { url: "https://account-verify-update.net", rating: "SUSPICIOUS", score: 55, date: "2 days ago" },
  { url: "https://aws.amazon.com", rating: "SAFE", score: 100, date: "2 days ago" },
  { url: "https://apple-security-check.info", rating: "DANGEROUS", score: 10, date: "3 days ago" },
  { url: "https://wikipedia.org", rating: "SAFE", score: 100, date: "3 days ago" },
  { url: "https://chase-security-verify.com", rating: "DANGEROUS", score: 8, date: "3 days ago" },
  { url: "https://cloudflare.com", rating: "SAFE", score: 100, date: "4 days ago" },
  { url: "https://netflix-account-reset.org", rating: "SUSPICIOUS", score: 52, date: "4 days ago" },
  { url: "https://stackoverflow.com", rating: "SAFE", score: 100, date: "5 days ago" }
];

export async function GET() {
  try {
    await dbConnect();
    const history = await UrlScan.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Format response to match expected UI structure
    const formatted = history.map((item) => ({
      url: item.url,
      rating: item.rating,
      score: item.score,
      date: item.date
    }));

    if (formatted.length === 0) {
      return NextResponse.json(DEFAULT_HISTORY);
    }

    const existingUrls = new Set(formatted.map((i) => i.url.toLowerCase()));
    const merged = [
      ...formatted,
      ...DEFAULT_HISTORY.filter((i) => !existingUrls.has(i.url.toLowerCase()))
    ];
    return NextResponse.json(merged);
  } catch (err) {
    console.error('Failed to fetch scan history:', err);
    return NextResponse.json(DEFAULT_HISTORY);
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

    const { url, rating, score } = body;

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

    // Safely delete previous scans matching the normalized URL without regex injection
    await UrlScan.deleteMany({ url: validUrl.originalUrl });

    const newScan = await UrlScan.create({
      url: validUrl.originalUrl,
      rating: validRating,
      score: validScore,
      date: new Date().toLocaleDateString()
    });

    return NextResponse.json({ success: true, data: newScan });
  } catch (err) {
    console.error('Failed to save scan result:', err);
    return NextResponse.json({ error: 'Failed to save scan result' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await UrlScan.deleteMany({});
    return NextResponse.json({ success: true, message: 'Scan history cleared successfully' });
  } catch (err) {
    console.error('Failed to clear scan history:', err);
    return NextResponse.json({ error: 'Failed to clear scan history' }, { status: 500 });
  }
}
