"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  Zap, 
  WifiOff, 
  Bell, 
  BellOff,
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCheck, 
  Check, 
  Trash2, 
  X,
  ExternalLink,
  RotateCw
} from "lucide-react";

export default function Header({ isOnline = true, setActiveTab, onSearch, scanHistory = [] }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Generate notifications from real threats in database
  const derivedAlerts = useMemo(() => {
    if (!scanHistory || scanHistory.length === 0) return [];
    const threats = scanHistory.filter((s) => s.rating === "DANGEROUS" || s.rating === "SUSPICIOUS");
    return threats.slice(0, 8).map((t, idx) => ({
      id: `threat-${idx}-${t.url}`,
      title: t.rating === "DANGEROUS" ? "Phishing Threat Intercepted" : "Suspicious Activity Detected",
      desc: (t.detectionReasons && t.detectionReasons[0]) || `URL rated ${t.rating} with safety score ${t.score}/100`,
      time: t.timeAgo || t.date || "Recent",
      read: false,
      severity: t.rating === "DANGEROUS" ? "critical" : "warning",
      category: "url-scanner",
      target: t.url
    }));
  }, [scanHistory]);

  const [readIds, setReadIds] = useState(() => new Set());
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  const notifications = useMemo(() => {
    return derivedAlerts
      .filter((alert) => !dismissedIds.has(alert.id))
      .map((alert) => ({
        ...alert,
        read: readIds.has(alert.id)
      }));
  }, [derivedAlerts, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  const handleMarkAllAsRead = (e) => {
    if (e) e.stopPropagation();
    setReadIds(new Set(derivedAlerts.map((a) => a.id)));
  };

  const handleToggleRead = (id, e) => {
    if (e) e.stopPropagation();
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDismissNotification = (id, e) => {
    if (e) e.stopPropagation();
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleClearAll = (e) => {
    if (e) e.stopPropagation();
    setDismissedIds(new Set(derivedAlerts.map((a) => a.id)));
  };

  const handleRestoreSampleAlerts = (e) => {
    if (e) e.stopPropagation();
    setDismissedIds(new Set());
    setReadIds(new Set());
  };

  const handleItemClick = (alert) => {
    if (!alert.read) {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(alert.id);
        return next;
      });
    }

    if (alert.category && typeof setActiveTab === "function") {
      setActiveTab(alert.category);
      setShowNotifications(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else if (setActiveTab) {
        setActiveTab("url-scanner");
      }
    }
  };

  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      case "warning":
        return <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      default:
        return <ShieldCheck className="h-3.5 w-3.5 text-[#1463FF] shrink-0" />;
    }
  };

  return (
    <header className="h-[68px] bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Left panel: Quick search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        <div className="relative w-full flex items-center">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search threats, domains, IPs, hashes..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-9 pr-14 text-xs outline-none focus:border-[#1463FF] transition-colors text-slate-800 placeholder:text-slate-400 focus:bg-white"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
              Ctrl
            </kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right panel: Alerts center & online stats */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status badge */}
        {isOnline ? (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Zap className="h-3 w-3" /> Live Shield Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
            <WifiOff className="h-3 w-3" /> Local Mode Offline
          </span>
        )}

        {/* Notifications center */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            aria-expanded={showNotifications}
            className={`p-2 rounded-xl border transition-all relative outline-none cursor-pointer ${
              showNotifications
                ? "bg-[#1463FF]/10 border-[#1463FF]/40 text-[#1463FF]"
                : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-xs ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-[#1463FF]/10 text-[#1463FF]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Active Threat Feeds
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {unreadCount > 0 ? `${unreadCount} unread threat alerts` : "All alerts caught up"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    title="Mark all notifications as read"
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      unreadCount > 0
                        ? "text-[#1463FF] hover:bg-[#1463FF]/10"
                        : "text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all</span>
                  </button>

                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      title="Clear all alerts"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === "all"
                        ? "bg-[#0B1933] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("unread")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === "unread"
                        ? "bg-[#1463FF] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleItemClick(alert)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        !alert.read
                          ? "bg-white border-blue-200 shadow-2xs hover:border-[#1463FF]"
                          : "bg-slate-50/70 border-slate-100 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {renderSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-bold leading-tight truncate block ${!alert.read ? "text-[#0B1933]" : "text-slate-600"}`}>
                              {alert.title}
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {alert.desc}
                            </p>
                            {alert.target && (
                              <code className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono mt-1.5 inline-block truncate max-w-full">
                                {alert.target}
                              </code>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
                          <span className="text-[9px] text-slate-400">
                            {alert.time}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleToggleRead(alert.id, e)}
                              title={alert.read ? "Mark as unread" : "Mark as read"}
                              className="p-1 rounded-md text-slate-400 hover:text-[#1463FF] hover:bg-slate-200/60 cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDismissNotification(alert.id, e)}
                              title="Dismiss"
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {alert.category && typeof setActiveTab === "function" && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-[#1463FF]">
                          <span className="font-medium">Open in {alert.category.replace("-", " ")}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <BellOff className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#0B1933]">
                      {activeFilter === "unread" ? "No unread alerts" : "No threat alerts"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Threat alerts will appear here.
                    </p>
                    {notifications.length === 0 && (
                      <button
                        type="button"
                        onClick={handleRestoreSampleAlerts}
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#1463FF] hover:underline cursor-pointer"
                      >
                        <RotateCw className="h-3 w-3" /> Reset demo alerts
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Local Threat Engine Sync: Active
                </span>
                {typeof setActiveTab === "function" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("history");
                      setShowNotifications(false);
                    }}
                    className="font-bold text-[#1463FF] hover:underline cursor-pointer"
                  >
                    View History →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar circle "N" */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab("settings")}
          title="SecOps Analyst Profile"
          className="h-8.5 w-8.5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-[#0B1933] hover:ring-2 hover:ring-[#1463FF]/30 transition-all cursor-pointer shrink-0"
        >
          N
        </button>
      </div>
    </header>
  );
}
