"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  KeyRound 
} from "lucide-react";

export default function ComplaintsTab({ isOnline }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, registered: 0, underReview: 0, resolved: 0, dangerous: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth state
  const [adminKey, setAdminKey] = useState("phishguard-secops-admin-key-2026");
  const [authInput, setAuthInput] = useState("phishguard-secops-admin-key-2026");

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [verdictFilter, setVerdictFilter] = useState("ALL");
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

  const fetchComplaints = useCallback(async () => {
    if (!isOnline) {
      setError("Offline: Cannot connect to administrative backend.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (verdictFilter !== "ALL") params.append("verdict", verdictFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/admin/complaints?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${adminKey}`,
          "x-admin-key": adminKey
        }
      });

      if (res.status === 401 || res.status === 403) {
        setError("Admin authentication failed. Enter valid SecOps Admin Key.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setComplaints(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalCount(json.pagination?.total || 0);
      if (json.stats) {
        setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [adminKey, isOnline, page, statusFilter, categoryFilter, verdictFilter, searchTerm]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!isOnline) {
        if (!ignore) setError("Offline: Cannot connect to administrative backend.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10"
        });
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (categoryFilter !== "ALL") params.append("category", categoryFilter);
        if (verdictFilter !== "ALL") params.append("verdict", verdictFilter);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const res = await fetch(`/api/admin/complaints?${params.toString()}`, {
          headers: {
            "Authorization": `Bearer ${adminKey}`,
            "x-admin-key": adminKey
          }
        });

        if (res.status === 401 || res.status === 403) {
          if (!ignore) {
            setError("Admin authentication failed. Enter valid SecOps Admin Key.");
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || `HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!ignore) {
          setComplaints(json.data || []);
          setTotalPages(json.pagination?.totalPages || 1);
          setTotalCount(json.pagination?.total || 0);
          if (json.stats) {
            setStats(json.stats);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load complaints:", err);
          setError(err.message || "Failed to load reports");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [adminKey, isOnline, page, statusFilter, categoryFilter, verdictFilter, searchTerm]);

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
          "Authorization": `Bearer ${adminKey}`,
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          complaintId: selectedComplaint.complaintId,
          status: statusChange || selectedComplaint.status,
          adminNotes: notesInput
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update report");
      }

      const updated = await res.json();
      setActionSuccess("Report status and notes updated successfully.");
      setSelectedComplaint(updated.data);
      fetchComplaints();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    if (verdict === "SAFE") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">SAFE</span>;
    if (verdict === "SUSPICIOUS") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">SUSPICIOUS</span>;
    if (verdict === "DANGEROUS") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">DANGEROUS</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">UNKNOWN</span>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "REGISTERED":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Registered</span>;
      case "UNDER_REVIEW":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case "RESOLVED":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & SecOps Credentials Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Threat Reports &amp; Complaints</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 ml-1">
            Real-time phishing reports filed directly by users via Phish-Guard Android browser and web extensions.
          </p>
        </div>

        {/* Admin Credential Input */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 focus-within:border-indigo-500 transition-colors">
            <KeyRound className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              placeholder="SecOps Admin Key"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              className="bg-transparent text-xs text-slate-800 outline-none w-48 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => {
              setAdminKey(authInput);
              setPage(1);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-[0.98]"
          >
            Authenticate
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Total Reports</span>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>New (Registered)</span>
            <div className="p-1.5 bg-sky-50 rounded-lg">
              <Clock className="h-4 w-4 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-600">{stats.registered}</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Under Review</span>
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.underReview}</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>Resolved</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5 font-medium">
            <span>High Risk Links</span>
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.dangerous}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 flex-1 max-w-sm focus-within:border-indigo-500 transition-colors">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, hostname, or URL..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 text-xs text-slate-700 font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Status: All</option>
            <option value="REGISTERED">Registered</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 text-xs text-slate-700 font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Category: All</option>
            <option value="PHISHING">Phishing</option>
            <option value="MALWARE">Malware</option>
            <option value="FAKE_LOGIN">Fake Login</option>
            <option value="SCAM">Scam</option>
            <option value="SUSPICIOUS_REDIRECT">Redirect</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={verdictFilter}
            onChange={(e) => {
              setVerdictFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 text-xs text-slate-700 font-medium border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">Risk: All</option>
            <option value="DANGEROUS">Dangerous</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="SAFE">Safe</option>
          </select>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition active:scale-[0.98]"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <span className="font-medium">{error}</span>
          <button onClick={fetchComplaints} className="underline font-bold hover:text-rose-900">Retry</button>
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Complaint ID</th>
                <th className="py-3.5 px-4">Host / URL</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Verdict / Score</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading complaint registry...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-slate-400 font-medium">
                    No complaint reports found matching current filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.complaintId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {item.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{item.hostname}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs font-mono">{item.originalUrl}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getVerdictBadge(item.detectionVerdict)}
                        <span className="text-[10px] text-slate-500 font-medium">Score {item.safetyScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 font-medium">
                      {item.source === "ANDROID_BROWSER" ? "📱 Android" : item.source}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt || item.detectedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setStatusChange(item.status);
                          setNotesInput(item.adminNotes || "");
                          setActionSuccess(null);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/80 hover:border-transparent transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium">
          <div>
            Showing {complaints.length} of {totalCount} reports (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-slate-700 font-bold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details & Investigation Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Complaint Details: <span className="text-indigo-600 font-mono">{selectedComplaint.complaintId}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                  {actionSuccess}
                </div>
              )}

              {/* URL & Host Overview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Reported URL (Untrusted Input)</span>
                  <span className="font-mono text-slate-700 font-semibold">{selectedComplaint.hostname}</span>
                </div>
                <div className="text-xs font-mono text-slate-900 break-all bg-white p-2.5 rounded-lg border border-slate-200 select-all">
                  {selectedComplaint.originalUrl}
                </div>
              </div>

              {/* Classification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Category</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{selectedComplaint.category}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Verdict</span>
                  <div className="mt-1">{getVerdictBadge(selectedComplaint.detectionVerdict)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Safety Score</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">{selectedComplaint.safetyScore} / 100</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Reporter</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{selectedComplaint.reporterType} ({selectedComplaint.source})</span>
                </div>
              </div>

              {/* Detection Evidence & Warnings */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Detection Evidence &amp; Engine Triggers
                </span>
                {selectedComplaint.detectionReasons && selectedComplaint.detectionReasons.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedComplaint.detectionReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-slate-500">No specific heuristics triggered. Flagged by ML engine or user report.</span>
                )}
              </div>

              {/* User Description */}
              {selectedComplaint.description && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    User Statement / Description
                  </span>
                  <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{selectedComplaint.description}&rdquo;
                  </p>
                </div>
              )}

              {/* Admin Investigation Form */}
              <form onSubmit={handleUpdateComplaint} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  SecOps Triage &amp; Status Update
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Investigation Status</label>
                    <select
                      value={statusChange}
                      onChange={(e) => setStatusChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="REGISTERED">Registered</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="RESOLVED">Resolved (Threat Mitigated)</option>
                      <option value="REJECTED">Rejected (False Positive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-medium block mb-1">Confirmed Timestamp</label>
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono">
                      {new Date(selectedComplaint.userConfirmedAt || selectedComplaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-medium block mb-1">Internal Admin Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Enter SecOps triage notes, IOC references, or blacklist additions..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition shadow-xs"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Updating..." : "Save Status & Notes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
