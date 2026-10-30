import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import UrlScan from '../../../lib/models/UrlScan';
import { validateAndNormalizeUrl } from '@/lib/security/urlValidation';

const DEFAULT_HISTORY = [
  { url: "https://example.com", rating: "SAFE", score: 98, source: "Web Dashboard", date: "Today" },
  { url: "http://secure-login-update.com", rating: "SUSPICIOUS", score: 48, source: "Android App", date: "Today" },
  { url: "https://github.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "Today" },
  { url: "http://paypal-account-verifiy.net", rating: "DANGEROUS", score: 12, source: "Android App", date: "Today" },
  { url: "https://google.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "Yesterday" },
  { url: "https://portal-login-auth.com", rating: "DANGEROUS", score: 15, source: "Android App", date: "Yesterday" },
  { url: "https://microsoft.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "Yesterday" },
  { url: "https://account-verify-update.net", rating: "SUSPICIOUS", score: 55, source: "Android App", date: "2 days ago" },
  { url: "https://aws.amazon.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "2 days ago" },
  { url: "https://apple-security-check.info", rating: "DANGEROUS", score: 10, source: "Android App", date: "3 days ago" },
  { url: "https://wikipedia.org", rating: "SAFE", score: 100, source: "Web Dashboard", date: "3 days ago" },
  { url: "https://chase-security-verify.com", rating: "DANGEROUS", score: 8, source: "Android App", date: "3 days ago" },
  { url: "https://cloudflare.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "4 days ago" },
  { url: "https://netflix-account-reset.org", rating: "SUSPICIOUS", score: 52, source: "Android App", date: "4 days ago" },
  { url: "https://stackoverflow.com", rating: "SAFE", score: 100, source: "Web Dashboard", date: "5 days ago" }
];

export async function GET() {
  try {
    await dbConnect();
    const history = await UrlScan.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Format response to match expected UI structure including device source
    const formatted = history.map((item) => ({
      _id: item._id?.toString(),
      url: item.url,
      rating: item.rating,
      score: item.score,
      source: item.source || "Web Dashboard",
      date: item.date,
      createdAt: item.createdAt
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

    const { url, rating, score, source } = body;

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

    // Safely delete previous scans matching the normalized URL without regex injection
    await UrlScan.deleteMany({ url: validUrl.originalUrl });

    const newScan = await UrlScan.create({
      url: validUrl.originalUrl,
      rating: validRating,
      score: validScore,
      source: validSource,
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
