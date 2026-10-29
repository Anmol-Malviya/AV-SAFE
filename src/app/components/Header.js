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

const INITIAL_ALERTS = [
  {
    id: "alert-1",
    title: "Typosquat Intercepted",
    desc: "Detected fake paypal login target link.",
    time: "10m ago",
    read: false,
    severity: "critical",
    category: "url-scanner",
    target: "paypal.com-verify.xyz"
  },
  {
    id: "alert-2",
    title: "DKIM Signature Invalid",
    desc: "Forced reject on suspicious spf verify.",
    time: "1h ago",
    read: false,
    severity: "warning",
    category: "email-scanner",
    target: "billing@paypal-support.com"
  },
  {
    id: "alert-3",
    title: "Threat Feed Synced",
    desc: "15,000 active domain rules loaded into memory.",
    time: "3h ago",
    read: true,
    severity: "info",
    category: "overview",
    target: "Phishing.Database"
  }
];

export default function Header({ isOnline, setActiveTab }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_ALERTS);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "unread"
  const dropdownRef = useRef(null);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Close dropdown on outside click or escape key
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

  // Mark all notifications as read
  const handleMarkAllAsRead = (e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((alert) => ({
        ...alert,
        read: true
      }))
    );
  };

  // Toggle single notification read status
  const handleToggleRead = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: !alert.read } : alert
      ))
    ;
  };

  // Dismiss / delete single notification
  const handleDismissNotification = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Clear all notifications
  const handleClearAll = (e) => {
    if (e) e.stopPropagation();
    setNotifications([]);
  };

  // Reset sample alerts if cleared
  const handleRestoreSampleAlerts = (e) => {
    if (e) e.stopPropagation();
    setNotifications(INITIAL_ALERTS);
  };

  // Handle clicking on an alert item
  const handleItemClick = (alert) => {
    // Automatically mark this item as read
    if (!alert.read) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === alert.id ? { ...item, read: true } : item
        )
      );
    }

    // If destination category and setActiveTab exist, navigate to tab
    if (alert.category && typeof setActiveTab === "function") {
      setActiveTab(alert.category);
      setShowNotifications(false);
    }
  };

  // Render severity icon
  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />;
      case "warning":
        return <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      default:
        return <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Left panel: Quick search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-sm">
        {/* Mobile Branding Logo */}
        <img
          src="/ic_app_logo.png"
          alt="AV-SAFE"
          className="flex lg:hidden h-9 w-9 rounded-xl shadow-sm flex-shrink-0"
        />
        <div className="relative w-full flex items-center">
          <Search className="h-4 w-4 text-text-muted absolute left-3" />
          <input
            type="text"
            placeholder="Search threats, domains, IPs..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary transition-colors text-text-primary placeholder:text-text-muted focus:bg-white"
          />
        </div>
      </div>

      {/* Right panel: Alerts center & online stats */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Status badges */}
        {isOnline ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Zap className="h-3 w-3" /> Live Shield Active
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs">
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
                ? "bg-primary/10 border-primary/40 text-primary ring-2 ring-primary/20 shadow-xs"
                : "bg-white hover:bg-slate-50 border-slate-200/80 text-text-secondary hover:text-navy active:scale-95"
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            
            {/* Dynamic unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white shadow-xs ring-2 ring-white animate-in zoom-in-50">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Modal */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              
              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-navy block leading-tight">
                      Active Threat Feeds
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      {unreadCount > 0 ? `${unreadCount} unread threat alerts` : "All alerts caught up"}
                    </span>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Mark All as Read Button */}
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    title="Mark all notifications as read"
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      unreadCount > 0
                        ? "text-primary hover:bg-primary/10 active:scale-95"
                        : "text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>

                  {/* Clear All Button */}
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

              {/* Filter Pills (All / Unread) */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === "all"
                        ? "bg-navy text-white shadow-2xs"
                        : "bg-slate-100 text-text-secondary hover:bg-slate-200/80"
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter("unread")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activeFilter === "unread"
                        ? "bg-primary text-white shadow-2xs"
                        : "bg-slate-100 text-text-secondary hover:bg-slate-200/80"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              )}

              {/* Notification Alerts List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => handleItemClick(alert)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        !alert.read
                          ? "bg-white border-blue-200/90 shadow-2xs hover:border-primary hover:shadow-xs"
                          : "bg-slate-50/70 border-slate-100/90 hover:bg-slate-100/70"
                      }`}
                    >
                      {/* Left accent indicator for unread critical/warning items */}
                      {!alert.read && (
                        <div
                          className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md ${
                            alert.severity === "critical"
                              ? "bg-red-500"
                              : alert.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-primary"
                          }`}
                        />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {renderSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-bold leading-tight truncate ${
                                  !alert.read ? "text-navy" : "text-slate-600"
                                }`}
                              >
                                {alert.title}
                              </span>
                              {!alert.read && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                              {alert.desc}
                            </p>
                            {alert.target && (
                              <code className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono mt-1.5 inline-block truncate max-w-full">
                                {alert.target}
                              </code>
                            )}
                          </div>
                        </div>

                        {/* Right side: Time & Item Actions */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1">
                          <span className="text-[9px] text-text-muted font-normal">
                            {alert.time}
                          </span>

                          {/* Quick Action Buttons per Item */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Toggle Read Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleRead(alert.id, e)}
                              title={alert.read ? "Mark as unread" : "Mark as read"}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                alert.read
                                  ? "text-slate-400 hover:text-primary hover:bg-slate-200/60"
                                  : "text-primary hover:bg-primary/10"
                              }`}
                            >
                              <Check className="h-3 w-3" />
                            </button>

                            {/* Dismiss Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDismissNotification(alert.id, e)}
                              title="Dismiss notification"
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Click helper hint if interactive */}
                      {alert.category && typeof setActiveTab === "function" && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-primary group-hover:text-primary-dark">
                          <span className="font-medium">Open in {alert.category.replace("-", " ")}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Empty state */
                  <div className="text-center py-6 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <BellOff className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-navy">
                      {activeFilter === "unread" ? "No unread alerts" : "No threat alerts"}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {activeFilter === "unread"
                        ? "You're caught up with all live threat updates."
                        : "Threat intercepts and notifications will appear here."}
                    </p>
                    {notifications.length === 0 && (
                      <button
                        type="button"
                        onClick={handleRestoreSampleAlerts}
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        <RotateCw className="h-3 w-3" /> Reset demo alerts
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Local Threat Engine Sync: Active
                </span>
                {typeof setActiveTab === "function" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("history");
                      setShowNotifications(false);
                    }}
                    className="font-bold text-primary hover:underline cursor-pointer"
                  >
                    View History →
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
