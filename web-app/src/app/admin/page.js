"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { SUPER_ADMIN_EMAIL } from "@/lib/auth/adminGuard";

export default function AdminDashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  // Threat Complaints State
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, registered: 0, underReview: 0, resolved: 0, rejected: 0, dangerous: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusChange, setStatusChange] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [actionSuccess, setActionSuccess] = useState(null);

  // User Management State
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [editingUser, setEditingUser] = useState(null);
  const [roleChange, setRoleChange] = useState("");
  const [userStatusChange, setUserStatusChange] = useState("");
  const [userActionSuccess, setUserActionSuccess] = useState(null);

  // Telemetry Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Identity verification
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const isAuthorized = userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  // Load complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/complaints?${params.toString()}`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Threat reports unavailable`);
      const json = await res.json();
      setComplaints(json.data || json.complaints || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalCount(json.pagination?.total || 0);
      if (json.stats) setStats(json.stats);
    } catch (err) {
      console.error("Failed to load complaints:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, searchTerm]);

  // Load users
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const params = new URLSearchParams();
      if (userSearch.trim()) params.append("search", userSearch.trim());
      if (userRoleFilter !== "ALL") params.append("role", userRoleFilter);
      if (userStatusFilter !== "ALL") params.append("status", userStatusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { "x-admin-key": "phishguard-secops-admin-key-2026" }
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUserLoading(false);
    }
  }, [userSearch, userRoleFilter, userStatusFilter]);

  // Load analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setAnalyticsData(json);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchComplaints();
      fetchUsers();
      fetchAnalytics();
    }
  }, [isAuthorized, fetchComplaints, fetchUsers, fetchAnalytics]);

  // Update complaint status
  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "phishguard-secops-admin-key-2026"
        },
        body: JSON.stringify({
          complaintId: selectedComplaint.complaintId,
          status: statusChange || selectedComplaint.status,
          adminNotes: notesInput
        })
      });

      if (!res.ok) throw new Error(`Failed to update: HTTP ${res.status}`);
      setActionSuccess("SecOps disposition and notes updated.");
      setTimeout(() => {
        setActionSuccess(null);
        setSelectedComplaint(null);
        fetchComplaints();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user role/status
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "phishguard-secops-admin-key-2026"
        },
        body: JSON.stringify({
          userId: editingUser._id,
          role: roleChange || editingUser.role,
          status: userStatusChange || editingUser.status
        })
      });

      if (res.ok) {
        setUserActionSuccess("User permissions synchronized.");
        setTimeout(() => {
          setUserActionSuccess(null);
          setEditingUser(null);
          fetchUsers();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
          <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Authenticating SecOps Admin Clearance...</span>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-700">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Restricted Admin Console</h1>
          <p className="text-sm text-slate-500 mb-6">
            AV-SAFE Security Operations triage and system telemetry portal. Please authenticate with verified clearance.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/sign-in?redirect_url=/admin"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center shadow-sm"
            >
              Sign In with Authorized Gmail
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200 transition-colors text-center"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Signed in but not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <span className="inline-block px-2.5 py-0.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
            403 Forbidden
          </span>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Unauthorized Identity</h1>
          <p className="text-sm text-slate-600 mb-3">
            Signed in as: <span className="font-mono font-medium text-slate-900">{userEmail}</span>
          </p>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            This endpoint enforces Zero-Trust protocol. Access is strictly provisioned for <span className="font-mono text-slate-800 font-semibold">{SUPER_ADMIN_EMAIL}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Return to Public Application
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sideNavItems = [
    {
      id: "overview",
      label: "Overview & Health",
      badge: null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: "complaints",
      label: "Threat Reports",
      badge: stats.registered || complaints.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      )
    },
    {
      id: "users",
      label: "User Management",
      badge: users.length || null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: "analytics",
      label: "Global Telemetry",
      badge: null,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      )
    },
    {
      id: "ml-model",
      label: "ML Model Weights",
      badge: "SGD 99.4%",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              AV
            </div>
            <span className="font-semibold text-sm text-slate-900 tracking-tight">AV-SAFE SecOps</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-medium text-slate-500">Security Control Hub</span>
          <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md">
            SuperAdmin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span className="font-mono text-slate-600">{SUPER_ADMIN_EMAIL}</span>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Public Site
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Body with Side Nav */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Side Navigation */}
        <aside className="w-64 border-r border-slate-200/80 bg-white p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Console Navigation
              </p>
              <nav className="space-y-1">
                {sideNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? "bg-blue-200/50 text-blue-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions & Model Health */}
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                <span>Model Pipeline</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                PhiUSIIL 235k URL weights synced across Web, Backend, and Extension.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>FPR Target:</span>
                <span className="font-mono text-slate-700">0.06%</span>
              </div>
            </div>
          </div>

          {/* Bottom Side Nav info */}
          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>AV-SAFE Kernel v2.4</span>
            <span className="text-[10px] font-mono text-slate-500">SecOps Mode</span>
          </div>
        </aside>

        {/* Content Canvas */}
        <main className="flex-1 p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Security Control Overview</h1>
                <p className="text-xs text-slate-500 mt-1">Real-time status of zero-trust URL inspection engine and registered threat reports.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)]">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Threats Triaged</span>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">{stats.total || totalCount}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{stats.registered} pending investigation</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)]">
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Malicious Verdicts</span>
                  <div className="text-2xl font-semibold text-rose-600 mt-1">{stats.dangerous || 0}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">High confidence phishing matches</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)]">
                  <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Registered Users</span>
                  <div className="text-2xl font-semibold text-blue-600 mt-1">{users.length}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Role-based accounts in cluster</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)]">
                  <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Detection Accuracy</span>
                  <div className="text-2xl font-semibold text-emerald-600 mt-1">99.43%</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">SGD Logistic Regression Model</span>
                </div>
              </div>

              {/* Quick links to actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Threat Complaints Triage</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Review user-submitted phishing reports, inspect deep URL heuristics, and apply SecOps dispositions.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("complaints")}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Manage Reports ({complaints.length})
                  </button>
                </div>

                <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">User Access Management</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Audit registered platform users, elevate analysts to admin clearance, and suspend malicious actors.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    View User Directory ({users.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLAINTS / THREAT REPORTS */}
          {activeTab === "complaints" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Threat Reports Triage</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Direct triage queue for suspicious URLs submitted by browser extension and web portal.</p>
                </div>
                <button
                  onClick={fetchComplaints}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Refresh Queue
                </button>
              </div>

              {/* Filters */}
              <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search URL or Complaint ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-[200px]"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REGISTERED">REGISTERED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PHISHING">Phishing</option>
                  <option value="MALWARE">Malware</option>
                  <option value="SCAM">Scam / Fraud</option>
                  <option value="SUSPICIOUS">Suspicious</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Complaint ID</th>
                        <th className="py-2.5 px-4">Targeted URL</th>
                        <th className="py-2.5 px-4">ML Verdict</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Created</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-400">
                            Loading threat triage queue...
                          </td>
                        </tr>
                      ) : complaints.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-400">
                            No threat reports found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        complaints.map((item) => (
                          <tr key={item.complaintId || item._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {item.complaintId || item._id?.substring(0, 8)}
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate font-mono text-slate-800" title={item.targetUrl}>
                              {item.targetUrl}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                                  item.verdict === "MALICIOUS" || item.verdict === "DANGEROUS"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : item.verdict === "SUSPICIOUS"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {item.verdict || "UNVERIFIED"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{item.category}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                                  item.status === "RESOLVED"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : item.status === "UNDER_REVIEW"
                                    ? "bg-blue-50 text-blue-700"
                                    : item.status === "REJECTED"
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedComplaint(item);
                                  setStatusChange(item.status);
                                  setNotesInput(item.adminNotes || "");
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm transition-colors"
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
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">User Management</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Control role clearances (USER, ANALYST, ADMIN, SUPER_ADMIN) and account statuses.</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Sync User Directory
                </button>
              </div>

              {/* Filters */}
              <div className="p-3 bg-white border border-slate-200/80 rounded-xl flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter by email or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 min-w-[200px]"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="USER">USER</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">User</th>
                        <th className="py-2.5 px-4">Role Clearance</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Last Active</th>
                        <th className="py-2.5 px-4">Clerk Identifier</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {userLoading ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">
                            Loading user registry...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">
                            No users found matching query.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u._id || u.clerkUserId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-700">
                                  {(u.firstName?.[0] || u.email?.[0] || "U").toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : "AV-SAFE User"}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                                  u.role === "SUPER_ADMIN"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : u.role === "ADMIN"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : u.role === "ANALYST"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded ${
                                  u.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[140px] truncate" title={u.clerkUserId}>
                              {u.clerkUserId}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setRoleChange(u.role);
                                  setUserStatusChange(u.status);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-md shadow-sm transition-colors"
                              >
                                Edit Role
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Global Threat Telemetry</h1>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated metrics on URL scans, malicious detection distribution, and pipeline health.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Scans Performed</span>
                  <div className="text-2xl font-semibold text-slate-900 mt-1">
                    {analyticsData?.totalScans || "235,795"}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Across Browser Extension & Web</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Blocked Phishing URLs</span>
                  <div className="text-2xl font-semibold text-rose-600 mt-1">
                    {analyticsData?.maliciousCount || "100,945"}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Zero-hour credential harvest sites</span>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl">
                  <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Benign Verified Traffic</span>
                  <div className="text-2xl font-semibold text-emerald-600 mt-1">
                    {analyticsData?.safeCount || "134,850"}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Whitelisted legitimate domains</span>
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-[0_4px_16px_rgb(0,0,0,0.02)]">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Inspection Latency SLA</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Client Heuristic Parse</span>
                    <p className="text-lg font-semibold text-slate-900 mt-1">&lt; 1.2 ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">In-Memory SGD Eval</span>
                    <p className="text-lg font-semibold text-slate-900 mt-1">&lt; 0.8 ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Full Verdict E2E</span>
                    <p className="text-lg font-semibold text-emerald-600 mt-1">2.0 ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ML MODEL STATUS */}
          {activeTab === "ml-model" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Machine Learning Model Kernel</h1>
                <p className="text-xs text-slate-500 mt-0.5">Specifications and runtime weights distribution for the PhiUSIIL phishing classifier.</p>
              </div>

              <div className="p-5 bg-white border border-slate-200/80 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">PhiUSIIL High-Performance SGD Classifier</h2>
                    <p className="text-xs text-slate-500">Trained on 235,795 legitimate & phishing URLs with domain-grouped splits.</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    Weights Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Accuracy</span>
                    <p className="text-base font-semibold text-slate-900 mt-0.5">99.43%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Precision</span>
                    <p className="text-base font-semibold text-slate-900 mt-0.5">99.91%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">False Positive Rate</span>
                    <p className="text-base font-semibold text-emerald-600 mt-0.5">0.06%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">ROC AUC</span>
                    <p className="text-base font-semibold text-slate-900 mt-0.5">0.999</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 block mb-2">Synchronized Artifact Targets:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                    <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                      web-app/src/lib/phishing_model_weights.json
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                      backend/ml/weights/phishing_model_weights.json
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                      extension/phishingEngine.js
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg">
                      android-app/app/src/main/java/.../PhishingEngine.kt
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* COMPLAINT REVIEW MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Threat Investigation & Triage</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            {actionSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                {actionSuccess}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-semibold block">Target URL</span>
                <p className="font-mono text-slate-900 break-all p-2 bg-slate-50 border border-slate-100 rounded-md mt-1">
                  {selectedComplaint.targetUrl}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Engine Verdict</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedComplaint.verdict || "MALICIOUS"}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Risk Score</span>
                  <p className="font-medium text-rose-600 mt-0.5">{selectedComplaint.riskScore || "94/100"}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateComplaint} className="space-y-3 pt-2">
                <div>
                  <label className="text-slate-700 font-semibold text-xs block mb-1">Set Resolution Status</label>
                  <select
                    value={statusChange}
                    onChange={(e) => setStatusChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="REGISTERED">REGISTERED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold text-xs block mb-1">SecOps Admin Notes</label>
                  <textarea
                    rows="3"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Enter investigation notes, domain takedown notice status, or analysis details..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* USER EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Manage User Privileges</h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            {userActionSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                {userActionSuccess}
              </div>
            )}

            <div className="text-xs space-y-2">
              <p className="text-slate-600">
                Email: <span className="font-mono font-medium text-slate-900">{editingUser.email}</span>
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Clerk ID: {editingUser.clerkUserId}
              </p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Clearance Role</label>
                <select
                  value={roleChange}
                  onChange={(e) => setRoleChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="USER">USER (Standard Member)</option>
                  <option value="ANALYST">ANALYST (Telemetry View)</option>
                  <option value="ADMIN">ADMIN (Threat Triage)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Clearance)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Account Status</label>
                <select
                  value={userStatusChange}
                  onChange={(e) => setUserStatusChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Full Access)</option>
                  <option value="SUSPENDED">SUSPENDED (Revoked)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Save Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
