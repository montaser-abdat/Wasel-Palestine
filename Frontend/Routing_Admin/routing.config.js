(function (global) {
  const routing = (global.AdminRouting = global.AdminRouting || {});

  routing.config = {
    DEFAULT_ROUTE: "admin-dashboard",
    ROUTE_PATHS: {
      "admin-dashboard": "/Admin/Pages/Dashboard/Dashboard.html",
      "admin-incidents": "/Admin/Pages/Incidents/Incidents.html",
      "admin-performance":
        "/Admin/Pages/PerformanceReports/PerformanceReports.html",
      "admin-audit": "/Admin/Pages/AuditLog/AuditLog.html",
      "admin-checkpoints":
        "/Admin/Pages/CheckpointManagement/CheckpointManagement.html",
      "admin-moderation": "/Admin/Pages/ModerationQueue/ModerationQueue.html",
      "admin-users": "/Admin/Pages/UserManagement/UserManagement.html",
      "admin-settings": "/Admin/Pages/SystemSettings/SystemSettings.html",
      "admin-apimonitor": "/Admin/Pages/APIMonitor/APIMonitor.html",
      404: "/Admin/Pages/Dashboard/Dashboard.html",
    },
    PAGE_NAMESPACE_SELECTORS: {
      "admin-dashboard": ".dashboard-wrapper",
      "admin-incidents": ".incidents-page",
      "admin-performance": ".perf-page",
      "admin-audit": ".audit-page",
      "admin-checkpoints": ".cp-page",
      "admin-moderation": ".mq-page",
      "admin-users": ".user-management-page",
      "admin-settings": ".system-settings-page",
      "admin-apimonitor": ".api-monitor-page",
    },
    ROUTE_TITLES: {
      "admin-dashboard": "Analytics",
      "admin-incidents": "Incidents",
      "admin-performance": "Performance",
      "admin-audit": "Audit Log",
      "admin-checkpoints": "Checkpoints",
      "admin-moderation": "Moderation Queue",
      "admin-users": "User Management",
      "admin-settings": "System Settings",
      "admin-apimonitor": "API Monitor",
    },
  };
})(window);
