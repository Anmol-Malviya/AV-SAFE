import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';
import { inspectQrUrl } from '../../../../../../backend/services/qrSecurityService.js';
import { recordAuditEvent } from '../../../../../../backend/services/auditService.js';

export async function POST(request) {
  const auth = await requirePermission(request, 'qr_lab.analyze');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL payload string is required' }, { status: 400 });
    }

    const analysis = await inspectQrUrl(url);

    recordAuditEvent({
      actorId: auth.userId || 'analyst',
      actorEmail: auth.user?.email || '',
      actorRole: auth.role,
      action: 'QR_SECURITY_INSPECTION',
      resourceType: 'QR_PAYLOAD',
      resourceId: url.substring(0, 50),
      severity: analysis.verdict === 'DANGEROUS' || analysis.verdict === 'BLOCKED_SSRF' ? 'WARNING' : 'INFO',
      details: { verdict: analysis.verdict, threatScore: analysis.threatScore }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
