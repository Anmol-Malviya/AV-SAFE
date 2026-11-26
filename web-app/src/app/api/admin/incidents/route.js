import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';
import dbConnect from '../../../../../../backend/config/mongodb.js';
import SecurityIncident, { INCIDENT_STATUS } from '../../../../../../backend/models/SecurityIncident.js';
import { recordAuditEvent } from '../../../../../../backend/services/auditService.js';

const MOCK_INCIDENTS = [
  {
    _id: "inc_001",
    incidentId: "INC-2026-901",
    title: "Zero-Hour Credential Harvest Campaign on Office365 Spoof",
    severity: "P1",
    status: "INVESTIGATING",
    targetUrl: "https://login-microsoftonline-verify-auth.net/secure",
    targetHostname: "login-microsoftonline-verify-auth.net",
    assignedToEmail: "anmoldiscord4328@gmail.com",
    description: "Multi-factor token interceptor cloned portal targeting corporate credentials.",
    timeline: [
      { action: "INCIDENT_CREATED", actorEmail: "system", note: "Automated trigger from QR scan detection", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { action: "STATUS_CHANGE", actorEmail: "anmoldiscord4328@gmail.com", note: "Assigned to SecOps lead", newStatus: "INVESTIGATING", timestamp: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: "inc_002",
    incidentId: "INC-2026-902",
    title: "Spear-Phishing QR Code targeting Android Banking App",
    severity: "P2",
    status: "OPEN",
    targetUrl: "https://paytm-kyc-update-portal-2026.top/verify",
    targetHostname: "paytm-kyc-update-portal-2026.top",
    assignedToEmail: "",
    description: "Physical QR code sticker reported with suspicious financial redirect.",
    timeline: [
      { action: "INCIDENT_CREATED", actorEmail: "system", note: "Reported by Android Browser client", timestamp: new Date(Date.now() - 7200000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export async function GET(request) {
  const auth = await requirePermission(request, 'incidents.read');
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
      const incidents = await SecurityIncident.find().sort({ createdAt: -1 }).limit(50).lean();
      return NextResponse.json({ success: true, incidents });
    }

    return NextResponse.json({ success: true, incidents: MOCK_INCIDENTS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requirePermission(request, 'incidents.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { incidentId, status, note, assignedToEmail } = body;

    if (!incidentId) {
      return NextResponse.json({ error: 'incidentId is required' }, { status: 400 });
    }

    if (status && !INCIDENT_STATUS.includes(status)) {
      return NextResponse.json({ error: `Invalid incident status: ${status}` }, { status: 400 });
    }

    const actorEmail = auth.user?.email || 'anmoldiscord4328@gmail.com';

    try {
      await dbConnect();
      const inc = await SecurityIncident.findOne({ incidentId });
      if (inc) {
        const prevStatus = inc.status;
        if (status) inc.status = status;
        if (assignedToEmail) inc.assignedToEmail = assignedToEmail;
        inc.timeline.push({
          actorId: auth.userId || 'admin',
          actorEmail,
          action: 'STATUS_UPDATED',
          note: note || `Status changed from ${prevStatus} to ${status}`,
          previousStatus: prevStatus,
          newStatus: status
        });
        await inc.save();
        return NextResponse.json({ success: true, incident: inc });
      }
    } catch {
      // offline fallback
    }

    recordAuditEvent({
      actorId: auth.userId || 'admin',
      actorEmail,
      actorRole: auth.role,
      action: 'INCIDENT_MODIFIED',
      resourceType: 'INCIDENT',
      resourceId: incidentId,
      details: { status, assignedToEmail, note }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Incident ${incidentId} updated (offline ack)`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
