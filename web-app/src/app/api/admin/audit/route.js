import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';
import { queryAuditEvents, verifyAuditChainIntegrity } from '../../../../../../backend/services/auditService.js';

export async function GET(request) {
  const auth = await requirePermission(request, 'audit.read');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const actorId = searchParams.get('actorId');
  const resourceType = searchParams.get('resourceType');
  const severity = searchParams.get('severity');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const verify = searchParams.get('verify') === 'true';

  try {
    const data = await queryAuditEvents({ action, actorId, resourceType, severity, page, limit: 30 });
    let integrity = null;
    if (verify) {
      integrity = await verifyAuditChainIntegrity();
    }

    return NextResponse.json({
      success: true,
      ...data,
      integrity
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
