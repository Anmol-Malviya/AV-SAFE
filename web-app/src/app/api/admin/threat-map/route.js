import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';

/**
 * Privacy-preserving aggregated threat telemetry by geographic region
 * Never exposes exact user coordinates, IP addresses, or personal info.
 */
const REGIONAL_THREAT_DATA = [
  { regionCode: "US", country: "United States", totalThreats: 41200, p1Count: 1420, p2Count: 4890, topCategory: "Office365 Phish" },
  { regionCode: "IN", country: "India", totalThreats: 38400, p1Count: 1980, p2Count: 5120, topCategory: "Banking & QR Pay" },
  { regionCode: "GB", country: "United Kingdom", totalThreats: 18900, p1Count: 650, p2Count: 2310, topCategory: "Parcel Scam" },
  { regionCode: "DE", country: "Germany", totalThreats: 14200, p1Count: 410, p2Count: 1890, topCategory: "Credential Harvester" },
  { regionCode: "SG", country: "Singapore", totalThreats: 9800, p1Count: 310, p2Count: 1100, topCategory: "Crypto Phish" },
  { regionCode: "AU", country: "Australia", totalThreats: 8400, p1Count: 290, p2Count: 940, topCategory: "Tax Refund Scam" },
  { regionCode: "BR", country: "Brazil", totalThreats: 12100, p1Count: 520, p2Count: 1670, topCategory: "PIX Fraud" }
];

export async function GET(request) {
  const auth = await requirePermission(request, 'threat_map.read');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const totalAggregated = REGIONAL_THREAT_DATA.reduce((acc, r) => acc + r.totalThreats, 0);

  return NextResponse.json({
    success: true,
    privacyDisclaimer: "Aggregated Country-level telemetry. Exact user coordinates and private IPs are redacted by design.",
    totalAggregated,
    regions: REGIONAL_THREAT_DATA
  });
}
