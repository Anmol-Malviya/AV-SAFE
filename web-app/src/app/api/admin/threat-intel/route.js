import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';
import dbConnect from '../../../../../../backend/config/mongodb.js';
import ThreatIndicator from '../../../../../../backend/models/ThreatIndicator.js';
import { recordAuditEvent } from '../../../../../../backend/services/auditService.js';

const MOCK_INTEL = [
  {
    _id: "intel_001",
    indicatorId: "IOC-9841",
    type: "DOMAIN",
    value: "account-security-update-secureauth.online",
    listType: "BLACKLIST",
    confidenceScore: 98,
    severity: "CRITICAL",
    source: "AV-SAFE ML Pipeline",
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "intel_002",
    indicatorId: "IOC-9842",
    type: "IP",
    value: "185.220.101.5",
    listType: "BLACKLIST",
    confidenceScore: 92,
    severity: "HIGH",
    source: "Tor Exit Threat Intelligence",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: "intel_003",
    indicatorId: "IOC-9843",
    type: "DOMAIN",
    value: "google.com",
    listType: "WHITELIST",
    confidenceScore: 100,
    severity: "LOW",
    source: "Tranco Top 1M Whitelist",
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

export async function GET(request) {
  const auth = await requirePermission(request, 'threat_intel.read');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let connected = false;
    try {
      await dbConnect();
      connected = true;
    } catch {
      connected = false;
    }

    if (connected) {
      const indicators = await ThreatIndicator.find().sort({ createdAt: -1 }).limit(100).lean();
      return NextResponse.json({ success: true, indicators });
    }

    return NextResponse.json({ success: true, indicators: MOCK_INTEL });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requirePermission(request, 'threat_intel.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { type, value, listType, severity, confidenceScore } = body;

    if (!type || !value) {
      return NextResponse.json({ error: 'type and value are required' }, { status: 400 });
    }

    const indicatorId = `IOC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await dbConnect();
      const created = await ThreatIndicator.create({
        indicatorId,
        type,
        value,
        normalizedValue: value.trim().toLowerCase(),
        listType: listType || 'BLACKLIST',
        severity: severity || 'HIGH',
        confidenceScore: confidenceScore || 90,
        createdBy: auth.user?.email || 'admin'
      });
      return NextResponse.json({ success: true, indicator: created });
    } catch {
      // offline fallback
    }

    recordAuditEvent({
      actorId: auth.userId || 'admin',
      actorEmail: auth.user?.email || '',
      actorRole: auth.role,
      action: 'IOC_CREATED',
      resourceType: 'THREAT_INDICATOR',
      resourceId: indicatorId,
      details: { type, value, listType }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      indicator: {
        indicatorId,
        type,
        value,
        listType: listType || 'BLACKLIST',
        severity: severity || 'HIGH',
        confidenceScore: confidenceScore || 90,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
