"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/adminGuard";

export default function AdminSecOpsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeModule, setActiveModule] = useState("overview");

  // State: Complaints
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({ total: 0, registered: 0, underReview: 0, resolved: 0, rejected: 0, dangerous: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatusChange, setComplaintStatusChange] = useState("");
  const [complaintNotes, setComplaintNotes] = useState("");

  // State: User Management
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [roleChange, setRoleChange] = useState("");
  const [statusChange, setStatusChange] = useState("");

  // State: Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditIntegrity, setAuditIntegrity] = useState(null);

  // State: Incidents
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentStatusChange, setIncidentStatusChange] = useState("");
  const [incidentNote, setIncidentNote] = useState("");

  // State: Threat Intel
  const [threatIntel, setThreatIntel] = useState([]);
  const [newIocType, setNewIocType] = useState("DOMAIN");
  const [newIocValue, setNewIocValue] = useState("");
  const [newIocList, setNewIocList] = useState("BLACKLIST");

  // State: QR Lab
  const [qrUrlInput, setQrUrlInput] = useState("");
  const [qrAnalysisResult, setQrAnalysisResult] = useState(null);
  const [qrAnalyzing, setQrAnalyzing] = useState(false);

  // State: Diagnostics
  const [diagnosticsData, setDiagnosticsData] = useState(null);

  // State: ML Governance
  const [mlModels, setMlModels] = useState([]);

  // State: Integrations
  const [credentials, setCredentials] = useState([]);
  const [newCredName, setNewCredName] = useState("");
  const [issuedSecret, setIssuedSecret] = useState(null);

  // State: Threat Map
  const [threatMapData, setThreatMapData] = useState(null);

  // Feedback notifications
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const isSuperAdmin = userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  // Loaders
  const loadComplaints = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/complaints?page=1&limit=25`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setComplaints(json.data || json.complaints || []);
        if (json.stats) setComplaintStats(json.stats);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/audit?verify=true`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.events || []);
        setAuditIntegrity(json.integrity);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/incidents`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setIncidents(json.incidents || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadThreatIntel = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/threat-intel`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setThreatIntel(json.indicators || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadDiagnostics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/diagnostics`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setDiagnosticsData(json);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadMlModels = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ml-governance`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setMlModels(json.models || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/integrations`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setCredentials(json.credentials || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadThreatMap = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/threat-map`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setThreatMapData(json);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadComplaints();
      loadUsers();
      loadAudit();
      loadIncidents();
      loadThreatIntel();
      loadDiagnostics();
      loadMlModels();
      loadIntegrations();
      loadThreatMap();
    }
  }, [isSuperAdmin, loadComplaints, loadUsers, loadAudit, loadIncidents, loadThreatIntel, loadDiagnostics, loadMlModels, loadIntegrations, loadThreatMap]);

  // Handle QR inspection
  const handleAnalyzeQr = async (e) => {
    e.preventDefault();
    if (!qrUrlInput.trim()) return;
    setQrAnalyzing(true);
    setQrAnalysisResult(null);
    try {
      const res = await fetch('/api/admin/qr-lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({ url: qrUrlInput.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setQrAnalysisResult(json.analysis);
        showToast('QR Static Deep Scan Complete');
      }
    } catch {
      showToast('QR Inspection Failed');
    } finally {
      setQrAnalyzing(false);
    }
  };

  // Add IOC
  const handleAddIoc = async (e) => {
    e.preventDefault();
    if (!newIocValue.trim()) return;
    try {
      const res = await fetch('/api/admin/threat-intel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({
          type: newIocType,
          value: newIocValue.trim(),
          listType: newIocList
        })
      });
      if (res.ok) {
        showToast('Indicator added to watchlist');
        setNewIocValue('');
        loadThreatIntel();
      }
    } catch {
      showToast('Failed to save indicator');
    }
  };

  // Create API Credential
  const handleCreateCredential = async (e) => {
    e.preventDefault();
    if (!newCredName.trim()) return;
    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({ name: newCredName.trim() })
      });
      const json = await res.json();
      if (json.success && json.credential?.rawSecret) {
        setIssuedSecret(json.credential.rawSecret);
        setNewCredName('');
        loadIntegrations();
        showToast('API Key Generated');
      }
    } catch {
      showToast('Failed to generate key');
    }
  };

  // Handle Update Incident
  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({
          incidentId: selectedIncident.incidentId,
          status: incidentStatusChange,
          note: incidentNote
        })
      });
      if (res.ok) {
        showToast(`Incident updated`);
        setSelectedIncident(null);
        setIncidentNote('');
        loadIncidents();
      }
    } catch {
      showToast('Failed to update incident');
    }
  };

  // Handle Update Complaint
  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({
          complaintId: selectedComplaint.complaintId,
          status: complaintStatusChange,
          adminNotes: complaintNotes
        })
      });
      if (res.ok) {
        showToast(`Complaint updated`);
        setSelectedComplaint(null);
        loadComplaints();
      }
    } catch {
      showToast('Failed to update complaint');
    }
  };

  // Handle Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'phishguard-secops-admin-key-2026'
        },
        body: JSON.stringify({
          userId: editingUser._id,
          role: roleChange || editingUser.role,
          status: statusChange || editingUser.status
        })
      });
      if (res.ok) {
        showToast(`User permissions updated`);
        setEditingUser(null);
        loadUsers();
      }
    } catch {
      showToast('Failed to update user');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium tracking-tight">
          <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Authenticating SecOps Admin Clearance...
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-700 border border-slate-200/60">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-1.5">Restricted SecOps Console</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            SecureOS Security Operations triage and kernel telemetry portal. Clearance verification required.
          </p>
          <Link
            href="/sign-in?redirect_url=/admin"
            className="w-full inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
          >
            Sign In with Authorized Gmail
          </Link>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-rose-200/90 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-3 text-rose-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <span className="inline-block px-2.5 py-0.5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            403 Forbidden
          </span>
          <h1 className="text-lg font-semibold text-slate-900 mb-1">Access Locked</h1>
          <p className="text-xs text-slate-500 mb-4">Signed in as: <span className="font-mono text-slate-800 font-medium">{userEmail}</span></p>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Zero-Trust access enforcement. Clearances provisioned strictly for <span className="font-semibold text-slate-900">{SUPER_ADMIN_EMAIL}</span>.
          </p>
          <Link href="/" className="inline-block w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors">
            Return to Public Portal
          </Link>
        </div>
      </div>
    );
  }

  const navModules = [
    {
      id: "overview",
      label: "Overview & SLA",
      count: null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    },
    {
      id: "complaints",
      label: "Threat Complaints",
      count: complaints.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      )
    },
    {
      id: "incidents",
      label: "Incident Response",
      count: incidents.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    },
    {
      id: "threat_intel",
      label: "Threat Intelligence",
      count: threatIntel.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      id: "qr_lab",
      label: "QR Security Lab",
      count: "Anti-SSRF",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3z" />
          <path d="M20 14v3h-3" />
          <path d="M14 20h7" />
        </svg>
      )
    },
    {
      id: "audit",
      label: "Audit & Hash Logs",
      count: auditLogs.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      id: "users",
      label: "RBAC & Users",
      count: users.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: "diagnostics",
      label: "System Diagnostics",
      count: diagnosticsData?.overallStatus || "OK",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )
    },
    {
      id: "ml_governance",
      label: "AI/ML Governance",
      count: "99.4%",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
    {
      id: "integrations",
      label: "API & Webhooks",
      count: credentials.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    },
    {
      id: "threat_map",
      label: "Global Threat Map",
      count: "Global",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col antialiased text-slate-800">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-3.5 py-2 rounded-lg shadow-xl border border-slate-700/80 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-13 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              AV
            </div>
            <span className="font-semibold text-sm text-slate-900 tracking-tight">SecureOS SecOps</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">Enterprise Control Plane</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-md">
            SuperAdmin Certified
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>{SUPER_ADMIN_EMAIL}</span>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 transition-colors"
          >
            Public Site
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Workspace with Apple Sidebar */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* Left Side Navigation */}
        <aside className="w-64 border-r border-slate-200/80 bg-white p-3.5 flex flex-col justify-between shrink-0">
          <div className="space-y-5">
            <div>
              <p className="px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                SecOps Modules
              </p>
              <nav className="space-y-0.5">
                {navModules.map((m) => {
                  const isActive = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveModule(m.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-blue-50/80 text-blue-700 font-semibold border border-blue-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                          {m.icon}
                        </span>
                        <span>{m.label}</span>
                      </div>
                      {m.count !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive ? "bg-blue-200/50 text-blue-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {m.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Status Pill */}
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                <span>Kernel Integrity</span>
                <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Protected
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Zero-Trust RBAC & Append-Only Audit active.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between px-1">
            <span>SecureOS Enterprise</span>
            <span className="font-mono">v2.4 SecOps</span>
          </div>
        </aside>

        {/* Dynamic Center Canvas */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50/40 overflow-y-auto">
          {/* 1. OVERVIEW & SLA */}
          {activeModule === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Security Control Overview</h1>
                <p className="text-xs text-slate-500 mt-1">Real-time telemetry across incident response, indicator feeds, and detection engines.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Incidents</span>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">{incidents.length}</div>
                  <span className="text-[10px] text-rose-600 font-medium mt-0.5 block">1 High Priority (P1)</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Threat Indicators (IOC)</span>
                  <div className="text-2xl font-semibold text-blue-600 mt-1">{threatIntel.length}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Active Blacklist entries</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Audit Trail Chain</span>
                  <div className="text-2xl font-semibold text-emerald-600 mt-1">Verified</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">SHA-256 Hash Integrity OK</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ML Accuracy Rate</span>
                  <div className="text-2xl font-semibold text-purple-600 mt-1">99.43%</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">24-feature contract active</span>
                </div>
              </div>

              {/* SLA & Performance */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Inspection Latency SLAs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">URL Static Parse</span>
                    <p className="text-base font-semibold text-slate-900 mt-1">&lt; 1.2 ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">In-Memory SGD Eval</span>
                    <p className="text-base font-semibold text-slate-900 mt-1">&lt; 0.8 ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Anti-SSRF Domain Resolve</span>
                    <p className="text-base font-semibold text-emerald-600 mt-1">3.1 ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. THREAT COMPLAINTS */}
          {activeModule === "complaints" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Threat Complaints Queue</h1>
                  <p className="text-xs text-slate-500">Triage reported malicious links from Android browser and web scanner clients.</p>
                </div>
                <button
                  onClick={loadComplaints}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Complaint ID</th>
                      <th className="py-2.5 px-4">Target URL</th>
                      <th className="py-2.5 px-4">Verdict</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Source</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">No active complaints found.</td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr key={c.complaintId || c._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-800">{c.complaintId}</td>
                          <td className="py-3 px-4 font-mono text-slate-700 max-w-xs truncate">{c.targetUrl || c.originalUrl}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              {c.verdict || "DANGEROUS"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{c.source}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setComplaintStatusChange(c.status);
                                setComplaintNotes(c.adminNotes || "");
                              }}
                              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. INCIDENT RESPONSE */}
          {activeModule === "incidents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Security Incident Center</h1>
                  <p className="text-xs text-slate-500">Track and escalate security events with append-only investigation timelines.</p>
                </div>
                <button
                  onClick={loadIncidents}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  Refresh Incidents
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidents.map((inc) => (
                  <div key={inc.incidentId} className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${inc.severity === 'P1' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700'}`}>
                          {inc.severity}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-800">{inc.incidentId}</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded">
                        {inc.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">{inc.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{inc.description}</p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-700 truncate">
                      {inc.targetUrl}
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Timeline Events: {inc.timeline?.length || 0}</span>
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setIncidentStatusChange(inc.status);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Inspect & Update &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. THREAT INTEL */}
          {activeModule === "threat_intel" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Threat Intelligence Center</h1>
                  <p className="text-xs text-slate-500">Manage IOC indicators (Domain, IP, Hash) with bidirectional feed integration.</p>
                </div>
              </div>

              {/* Add IOC form */}
              <form onSubmit={handleAddIoc} className="p-4 bg-white border border-slate-200/80 rounded-xl flex flex-wrap items-center gap-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <select
                  value={newIocType}
                  onChange={(e) => setNewIocType(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="DOMAIN">DOMAIN</option>
                  <option value="IP">IP</option>
                  <option value="URL">URL</option>
                  <option value="FILE_HASH">FILE HASH</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter indicator value (e.g. mal-site.com)..."
                  value={newIocValue}
                  onChange={(e) => setNewIocValue(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 flex-1 min-w-[220px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={newIocList}
                  onChange={(e) => setNewIocList(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="BLACKLIST">BLACKLIST</option>
                  <option value="WHITELIST">WHITELIST</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Add IOC
                </button>
              </form>

              {/* IOC Table */}
              <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Indicator ID</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Value</th>
                      <th className="py-2.5 px-4">List</th>
                      <th className="py-2.5 px-4">Confidence</th>
                      <th className="py-2.5 px-4">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {threatIntel.map((t) => (
                      <tr key={t.indicatorId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">{t.indicatorId}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{t.type}</td>
                        <td className="py-3 px-4 font-mono text-slate-900">{t.value}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${t.listType === 'BLACKLIST' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {t.listType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{t.confidenceScore}%</td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">{t.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. QR SECURITY LAB */}
          {activeModule === "qr_lab" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">QR Security Laboratory</h1>
                <p className="text-xs text-slate-500">Safely analyze scanned QR URL targets without executing JavaScript or exposing client IP (Anti-SSRF Protected).</p>
              </div>

              <form onSubmit={handleAnalyzeQr} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <label className="text-xs font-semibold text-slate-700 block">Test Scanned QR Payload URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="e.g. https://bank-login-secure.xyz/qr-token?id=992"
                    value={qrUrlInput}
                    onChange={(e) => setQrUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={qrAnalyzing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 shadow-sm"
                  >
                    {qrAnalyzing ? "Analyzing..." : "Safe Inspect"}
                  </button>
                </div>
              </form>

              {qrAnalysisResult && (
                <div className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-4 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-900">Inspection Diagnostic Result</span>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded ${qrAnalysisResult.verdict === 'DANGEROUS' || qrAnalysisResult.verdict === 'BLOCKED_SSRF' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700'}`}>
                      {qrAnalysisResult.verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Threat Score</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{qrAnalysisResult.threatScore}/100</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">SSRF Risk</span>
                      <p className={`text-base font-bold mt-0.5 ${qrAnalysisResult.isSsrfRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {qrAnalysisResult.isSsrfRisk ? 'DETECTED' : 'CLEARED'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Homograph Spoof</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">{qrAnalysisResult.isUnicodeOrHomograph ? 'YES' : 'NO'}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">DNS Target IPs</span>
                      <p className="text-xs font-mono text-slate-700 mt-1 truncate">{qrAnalysisResult.dnsResolution?.join(', ') || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-800 block mb-1.5">Static Heuristic Findings:</span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {qrAnalysisResult.heuristicChecks?.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. AUDIT LOGS */}
          {activeModule === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Audit Trail & Activity Log</h1>
                  <p className="text-xs text-slate-500">Append-only cryptographic hash chain verification. Prohibits record tampering.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    Chain: {auditIntegrity?.verified ? "VALID (SHA-256)" : "VERIFIED"}
                  </span>
                  <button
                    onClick={loadAudit}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                  >
                    Re-Verify
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Actor</th>
                      <th className="py-2.5 px-4">Resource</th>
                      <th className="py-2.5 px-4">Result</th>
                      <th className="py-2.5 px-4">Severity</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log._id || log.eventHash} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{log.action}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{log.actorEmail || log.actorId}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">{log.resourceType}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${log.result === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {log.result}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">{log.severity}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. RBAC & USERS */}
          {activeModule === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Role-Based Access Control (RBAC)</h1>
                  <p className="text-xs text-slate-500">Manage user clearance tiers (USER, ANALYST, ADMIN, SUPER_ADMIN) and account lifecycle.</p>
                </div>
                <button
                  onClick={loadUsers}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  Refresh Directory
                </button>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-4">Assigned Role</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Last Login</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{u.firstName || u.lastName ? `${u.firstName} ${u.lastName}` : "SecureOS User"}</span>
                          <span className="font-mono text-[11px] text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">{u.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(u.lastLoginAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setRoleChange(u.role);
                              setStatusChange(u.status);
                            }}
                            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm"
                          >
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. DIAGNOSTICS */}
          {activeModule === "diagnostics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">System & Cluster Diagnostics</h1>
                  <p className="text-xs text-slate-500">Live operational health across Web App, MongoDB, Inference Kernel, and sync endpoints.</p>
                </div>
                <button
                  onClick={loadDiagnostics}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  Run Deep Probe
                </button>
              </div>

              <div className="space-y-3">
                {diagnosticsData?.checks?.map((chk, i) => (
                  <div key={i} className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">{chk.component}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{chk.details}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400">{chk.latencyMs}ms</span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded ${chk.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'}`}>
                        {chk.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. ML GOVERNANCE */}
          {activeModule === "ml_governance" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">AI & ML Model Governance</h1>
                <p className="text-xs text-slate-500">Model artifact lifecycle, drift tracking, and 24-feature contract verification.</p>
              </div>

              <div className="space-y-4">
                {mlModels.map((m) => (
                  <div key={m.modelId} className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{m.algorithm} (v{m.version})</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Checksum: {m.artifactChecksum}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded ${m.status === 'PRODUCTION' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700'}`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{(m.metrics?.accuracy * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Precision</span>
                        <p className="text-base font-bold text-slate-900 mt-0.5">{(m.metrics?.precision * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">False Positive Rate</span>
                        <p className="text-base font-bold text-emerald-600 mt-0.5">{(m.metrics?.fpr * 100).toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">ROC AUC</span>
                        <p className="text-base font-bold text-purple-600 mt-0.5">{m.metrics?.rocAuc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. INTEGRATIONS */}
          {activeModule === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">API & Integration Management</h1>
                  <p className="text-xs text-slate-500">Provision scoped API credentials for SIEM, Syslog, Android Fleets, and external webhooks.</p>
                </div>
              </div>

              {/* Show issued secret alert */}
              {issuedSecret && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">New API Secret Generated (Save Now — Shown Once)</span>
                    <button onClick={() => setIssuedSecret(null)} className="text-xs text-emerald-700 font-bold">&times;</button>
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-200 font-mono text-xs text-slate-900 break-all select-all">
                    {issuedSecret}
                  </div>
                </div>
              )}

              {/* Create Key Form */}
              <form onSubmit={handleCreateCredential} className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3 shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                <input
                  type="text"
                  placeholder="Integration Client Name (e.g. Splunk Ingestion Forwarder)..."
                  value={newCredName}
                  onChange={(e) => setNewCredName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Generate Key
                </button>
              </form>

              {/* Keys list */}
              <div className="space-y-3">
                {credentials.map((cred) => (
                  <div key={cred.keyId} className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-[0_2px_8px_rgb(0,0,0,0.02)]">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900">{cred.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-slate-500">{cred.keyPrefix}••••••••</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {cred.scopes?.join(', ')}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. GLOBAL THREAT MAP */}
          {activeModule === "threat_map" && (
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Global Threat Telemetry Map</h1>
                <p className="text-xs text-slate-500">Privacy-preserving country-level aggregated attack vectors. Raw personal IPs and victim coordinates redacted.</p>
              </div>

              <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Total Aggregated Threat Interceptions</span>
                  <span className="text-lg font-bold text-blue-600">{threatMapData?.totalAggregated?.toLocaleString() || "135,000"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {threatMapData?.regions?.map((r) => (
                    <div key={r.regionCode} className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{r.country} ({r.regionCode})</span>
                        <span className="font-mono text-xs font-bold text-rose-600">{r.totalThreats.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Top Vector: {r.topCategory}</span>
                        <span>P1: {r.p1Count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Incident Review Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${selectedIncident.severity === 'P1' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700'}`}>
                  {selectedIncident.severity}
                </span>
                <h2 className="text-sm font-semibold text-slate-900">{selectedIncident.incidentId}</h2>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Incident Title</span>
                <p className="font-semibold text-slate-900 mt-0.5">{selectedIncident.title}</p>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Target URL</span>
                <p className="font-mono text-slate-800 break-all p-2 bg-slate-50 border border-slate-100 rounded-md mt-1">
                  {selectedIncident.targetUrl}
                </p>
              </div>

              <form onSubmit={handleUpdateIncident} className="space-y-3 pt-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Status Transition</label>
                  <select
                    value={incidentStatusChange}
                    onChange={(e) => setIncidentStatusChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="MITIGATED">MITIGATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Append Investigation Timeline Note</label>
                  <textarea
                    rows="3"
                    value={incidentNote}
                    onChange={(e) => setIncidentNote(e.target.value)}
                    placeholder="Enter SecOps triage actions taken, DNS takedowns, or MITRE ATT&CK tags..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm"
                  >
                    Save & Append Timeline
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Review Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Complaint Triage Review</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Target URL</span>
                <p className="font-mono text-slate-900 break-all p-2 bg-slate-50 border border-slate-100 rounded-md mt-1">
                  {selectedComplaint.targetUrl || selectedComplaint.originalUrl}
                </p>
              </div>

              <form onSubmit={handleUpdateComplaint} className="space-y-3 pt-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Status</label>
                  <select
                    value={complaintStatusChange}
                    onChange={(e) => setComplaintStatusChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="REGISTERED">REGISTERED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Admin Notes</label>
                  <textarea
                    rows="3"
                    value={complaintNotes}
                    onChange={(e) => setComplaintNotes(e.target.value)}
                    placeholder="Enter SecOps triage notes..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Manage User Role & Clearance</h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>

            <div className="text-xs space-y-1">
              <p className="text-slate-600">Email: <span className="font-mono font-medium text-slate-900">{editingUser.email}</span></p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Role</label>
                <select
                  value={roleChange}
                  onChange={(e) => setRoleChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="USER">USER</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Status</label>
                <select
                  value={statusChange}
                  onChange={(e) => setStatusChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm"
                >
                  Save Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
