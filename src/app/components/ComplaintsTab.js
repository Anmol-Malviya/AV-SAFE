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
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
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
        if (!ignore) setError(err.message || "Failed to load reports");
      } finally {
        if (!ignore) setLoading(false);
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
    if (verdict === "SAFE") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">SAFE</span>;
    if (verdict === "SUSPICIOUS") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">SUSPICIOUS</span>;
    if (verdict === "DANGEROUS") return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">DANGEROUS</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">UNKNOWN</span>;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "REGISTERED":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">Registered</span>;
      case "UNDER_REVIEW":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">Under Review</span>;
      case "RESOLVED":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-green-500/10 text-green-400 border border-green-500/30">Resolved</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-500/10 text-slate-400 border border-slate-500/30">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & SecOps Credentials Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-heading text-white">Threat Reports & Complaints</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time phishing reports filed directly by users via Phish-Guard Android browser and web extensions.
          </p>
        </div>

        {/* Admin Credential Input */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            <input
              type="password"
              placeholder="SecOps Admin Key"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none w-48"
            />
          </div>
          <button
            onClick={() => {
              setAdminKey(authInput);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl transition"
          >
            Authenticate
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Reports</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>New (Registered)</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.registered}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Under Review</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.underReview}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Resolved</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>High Risk Links</span>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.dangerous}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, hostname, or URL..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none w-full placeholder:text-slate-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 outline-none"
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
            className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 outline-none"
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
            className="bg-slate-950 text-xs text-slate-300 border border-slate-800 rounded-xl px-3 py-2 outline-none"
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
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchComplaints} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Complaints Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Host / URL</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Verdict / Score</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading complaint registry...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No complaint reports found matching current filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.complaintId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      {item.complaintId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{item.hostname}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs font-mono">{item.originalUrl}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {getVerdictBadge(item.detectionVerdict)}
                        <span className="text-[10px] text-slate-400">Score {item.safetyScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      {item.source === "ANDROID_BROWSER" ? "📱 Android" : item.source}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
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
                        className="px-2.5 py-1 bg-slate-800 hover:bg-primary text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
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
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing {complaints.length} of {totalCount} reports (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details & Investigation Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  Complaint Details: <span className="text-primary font-mono">{selectedComplaint.complaintId}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {actionSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs">
                  {actionSuccess}
                </div>
              )}

              {/* URL & Host Overview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Reported URL (Untrusted Input)</span>
                  <span className="font-mono">{selectedComplaint.hostname}</span>
                </div>
                <div className="text-xs font-mono text-white break-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 select-all">
                  {selectedComplaint.originalUrl}
                </div>
              </div>

              {/* Classification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Category</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedComplaint.category}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Verdict</span>
                  <div className="mt-1">{getVerdictBadge(selectedComplaint.detectionVerdict)}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Safety Score</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{selectedComplaint.safetyScore} / 100</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Reporter</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block">{selectedComplaint.reporterType} ({selectedComplaint.source})</span>
                </div>
              </div>

              {/* Detection Evidence & Warnings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Detection Evidence & Engine Triggers
                </span>
                {selectedComplaint.detectionReasons && selectedComplaint.detectionReasons.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedComplaint.detectionReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
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
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    User Statement / Description
                  </span>
                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                    &ldquo;{selectedComplaint.description}&rdquo;
                  </p>
                </div>
              )}

              {/* Admin Investigation Form */}
              <form onSubmit={handleUpdateComplaint} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  SecOps Triage & Status Update
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Investigation Status</label>
                    <select
                      value={statusChange}
                      onChange={(e) => setStatusChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="REGISTERED">Registered</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="RESOLVED">Resolved (Threat Mitigated)</option>
                      <option value="REJECTED">Rejected (False Positive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Confirmed Timestamp</label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400">
                      {new Date(selectedComplaint.userConfirmedAt || selectedComplaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Internal Admin Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Enter SecOps triage notes, IOC references, or blacklist additions..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
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
