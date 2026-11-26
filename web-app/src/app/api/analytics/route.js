import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UrlScan from '@/lib/models/UrlScan';
import Complaint from '@/lib/models/Complaint';
import { requireRole } from '@/lib/auth/authMiddleware';

export const dynamic = 'force-dynamic';

function getDayName(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

function classifyThreatCategory(url, rating, reasons = []) {
  const normUrl = (url || '').toLowerCase();
  const allReasons = reasons.join(' ').toLowerCase();

  if (rating === 'SAFE') return 'Safe Verification';
  if (allReasons.includes('typo') || normUrl.includes('gooogle') || normUrl.includes('paypa1')) {
    return 'Typosquatting';
  }
  if (allReasons.includes('brand') || allReasons.includes('@') || normUrl.includes('@')) {
    return 'Brand Spoofing';
  }
  if (normUrl.startsWith('http://') || allReasons.includes('http') || allReasons.includes('tls') || allReasons.includes('ssl')) {
    return 'Insecure (HTTP)';
  }
  if (allReasons.includes('idn') || allReasons.includes('punycode') || normUrl.includes('xn--')) {
    return 'IDN Homographs';
  }
  if (allReasons.includes('keyword') || normUrl.includes('login') || normUrl.includes('verify')) {
    return 'Credential Harvesting';
  }
  return 'Phishing & Malicious';
}

function detectTargetBrand(url, reasons = []) {
  const text = (url + ' ' + reasons.join(' ')).toLowerCase();
  if (text.includes('google')) return 'Google';
  if (text.includes('meesho')) return 'Meesho';
  if (text.includes('paypal')) return 'PayPal';
  if (text.includes('microsoft')) return 'Microsoft';
  if (text.includes('expandtesting')) return 'ExpandTesting';
  if (text.includes('megacashagent') || text.includes('megacash')) return 'MegaCashAgent';
  if (text.includes('chase')) return 'Chase Bank';
  if (text.includes('apple')) return 'Apple';
  if (text.includes('amazon') || text.includes('aws')) return 'Amazon';
  if (text.includes('github')) return 'GitHub';
  return null;
}

function resolveGeoOrigin(ip, hostname) {
  const cleanIp = (ip || '').trim();
  const host = (hostname || '').toLowerCase();

  if (cleanIp.startsWith('152.') || cleanIp.startsWith('14.139.') || cleanIp.startsWith('103.') || host.endsWith('.in')) {
    return 'India';
  }
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || host.includes('localhost')) {
    return 'Internal / Local';
  }
  if (host.endsWith('.cyou') || host.endsWith('.cn')) {
    return 'Asia-Pacific / China';
  }
  if (host.endsWith('.online') || host.endsWith('.xyz') || host.endsWith('.top')) {
    return 'Global Cloud / TLD';
  }
  if (host.endsWith('.de') || host.endsWith('.eu')) {
    return 'Germany / EU';
  }
  if (host.endsWith('.ru')) {
    return 'Russia';
  }
  return 'United States';
}

export async function GET(request) {
  try {
    // Analytics is restricted to ANALYST, ADMIN, or SUPER_ADMIN
    const roleCheck = await requireRole(request, 'ANALYST');
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error || 'Access denied. Analyst or Administrative privileges required for telemetry analytics.' },
        { status: roleCheck.status || 403 }
      );
    }

    await dbConnect();

    const [scans, complaints] = await Promise.all([
      UrlScan.find({}).sort({ createdAt: -1 }).limit(500).lean(),
      Complaint.find({}).sort({ createdAt: -1 }).limit(500).lean()
    ]);

    // Consolidate unique scan items (prefer scan record, include complaints)
    const combinedMap = new Map();

    scans.forEach((s) => {
      const key = (s.url || '').toLowerCase();
      if (key) {
        combinedMap.set(key, {
          url: s.url,
          rating: s.rating,
          score: s.score,
          createdAt: s.createdAt,
          source: s.source || 'Web Dashboard',
          reasons: s.detectionReasons || []
        });
      }
    });

    complaints.forEach((c) => {
      const key = (c.normalizedUrl || c.originalUrl || '').toLowerCase();
      if (key && !combinedMap.has(key)) {
        combinedMap.set(key, {
          url: c.originalUrl,
          rating: c.detectionVerdict,
          score: c.safetyScore,
          createdAt: c.createdAt,
          source: c.source || 'Threat Report',
          reasons: c.detectionReasons || []
        });
      }
    });

    const allEvents = Array.from(combinedMap.values());
    const totalScanned = allEvents.length;
    const threatsBlocked = allEvents.filter((e) => e.rating === 'DANGEROUS').length;
    const suspiciousCount = allEvents.filter((e) => e.rating === 'SUSPICIOUS').length;
    const safeCount = allEvents.filter((e) => e.rating === 'SAFE').length;

    // 1. Weekly Volume Trend (Last 7 days dynamic aggregation)
    const now = new Date();
    const daysArr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      daysArr.push({
        dateStr: d.toISOString().split('T')[0],
        day: getDayName(d),
        safe: 0,
        phishing: 0,
        suspicious: 0
      });
    }

    allEvents.forEach((ev) => {
      if (!ev.createdAt) return;
      const evDate = new Date(ev.createdAt).toISOString().split('T')[0];
      const bucket = daysArr.find((b) => b.dateStr === evDate);
      if (bucket) {
        if (ev.rating === 'DANGEROUS') bucket.phishing++;
        else if (ev.rating === 'SUSPICIOUS') bucket.suspicious++;
        else bucket.safe++;
      }
    });

    // 2. Threat Vector Breakdown
    const categoryCounts = {};
    allEvents.forEach((ev) => {
      if (ev.rating === 'DANGEROUS' || ev.rating === 'SUSPICIOUS') {
        const cat = classifyThreatCategory(ev.url, ev.rating, ev.reasons);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    const categoryColors = {
      'Typosquatting': '#3b82f6',
      'Credential Harvesting': '#f97316',
      'Brand Spoofing': '#ef4444',
      'Insecure (HTTP)': '#eab308',
      'IDN Homographs': '#8b5cf6',
      'Phishing & Malicious': '#ec4899'
    };

    const threatCategories = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#64748b'
    }));

    // 3. Brand Abuse Intelligence
    const brandCounts = {};
    allEvents.forEach((ev) => {
      const brand = detectTargetBrand(ev.url, ev.reasons);
      if (brand) {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });

    const targetBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, attacks]) => ({
        name,
        attacks,
        share: Math.round((attacks / (totalScanned || 1)) * 100)
      }));

    // 4. Geographic Threat Origins (derived from real telemetry IP and domain TLD)
    const geoCounts = {};
    complaints.forEach((c) => {
      const origin = resolveGeoOrigin(c.clientIp, c.hostname);
      geoCounts[origin] = (geoCounts[origin] || 0) + 1;
    });

    const totalGeo = Object.values(geoCounts).reduce((a, b) => a + b, 0) || 1;
    const geoOrigins = Object.entries(geoCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([country, attacks]) => ({
        country,
        attacks,
        percentage: Math.round((attacks / totalGeo) * 100)
      }));

    return NextResponse.json({
      summary: {
        totalScanned,
        threatsBlocked,
        suspiciousCount,
        safeCount,
        blockRate: totalScanned > 0 ? ((threatsBlocked / totalScanned) * 100).toFixed(1) : '0.0'
      },
      weeklyTrend: daysArr.map(({ day, safe, phishing, suspicious }) => ({ day, safe, phishing, suspicious })),
      threatCategories,
      targetBrands,
      geoOrigins
    });
  } catch (err) {
    console.error('Error generating telemetry analytics:', err);
    return NextResponse.json({ error: 'Failed to generate analytics data' }, { status: 500 });
  }
}
