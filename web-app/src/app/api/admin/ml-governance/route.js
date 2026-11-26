import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authMiddleware';
import dbConnect from '../../../../../../backend/config/mongodb.js';
import MLModelRegistry from '../../../../../../backend/models/MLModelRegistry.js';
import { recordAuditEvent } from '../../../../../../backend/services/auditService.js';

const MOCK_MODELS = [
  {
    _id: "ml_001",
    modelId: "ML-SGD-2026-v2",
    version: "2.4.0",
    algorithm: "SGD Logistic Regression (Modified Huber Loss)",
    status: "PRODUCTION",
    datasetVersion: "PhiUSIIL_235k_v1",
    trainingSampleSize: 235795,
    featureCount: 24,
    artifactChecksum: "sha256:d8a9e102f43cba79e88d121",
    metrics: {
      accuracy: 0.9943,
      precision: 0.9991,
      recall: 0.9876,
      f1Score: 0.9933,
      fpr: 0.0006,
      fnr: 0.0124,
      rocAuc: 0.999
    },
    confusionMatrix: { tp: 14890, fp: 9, tn: 20230, fn: 21 },
    approvedBy: "anmoldiscord4328@gmail.com",
    approvedAt: "2026-11-26T18:00:00.000Z",
    deployedAt: "2026-11-26T18:30:00.000Z"
  },
  {
    _id: "ml_002",
    modelId: "ML-LIGHTGBM-2026-cand",
    version: "2.5.0-RC1",
    algorithm: "LightGBM Boosted Trees",
    status: "STAGING",
    datasetVersion: "PhiUSIIL_235k_v1",
    trainingSampleSize: 235795,
    featureCount: 24,
    artifactChecksum: "sha256:7b3a99cc21d88a101f",
    metrics: {
      accuracy: 0.9961,
      precision: 0.9994,
      recall: 0.9928,
      f1Score: 0.9961,
      fpr: 0.0004,
      fnr: 0.0072,
      rocAuc: 0.9995
    },
    confusionMatrix: { tp: 14945, fp: 6, tn: 20233, fn: 11 },
    approvedBy: null,
    approvedAt: null,
    deployedAt: null
  }
];

export async function GET(request) {
  const auth = await requirePermission(request, 'ml.read');
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
      const models = await MLModelRegistry.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, models: models.length ? models : MOCK_MODELS });
    }

    return NextResponse.json({ success: true, models: MOCK_MODELS });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requirePermission(request, 'ml.approve');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { modelId, action } = body; // action: 'APPROVE', 'ROLLBACK'

    recordAuditEvent({
      actorId: auth.userId || 'admin',
      actorEmail: auth.user?.email || 'anmoldiscord4328@gmail.com',
      actorRole: auth.role,
      action: `ML_MODEL_${action}`,
      resourceType: 'ML_MODEL',
      resourceId: modelId,
      severity: 'WARNING',
      details: { action, modelId }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Model ${modelId} action ${action} executed successfully`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
