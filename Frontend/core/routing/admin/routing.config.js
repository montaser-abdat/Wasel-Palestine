(function (global) {
  const routing = (global.AdminRouting = global.AdminRouting || {});

  routing.config = {
    DEFAULT_ROUTE: "admin-dashboard",
    ROUTE_PATHS: {
      "admin-dashboard": "/features/admin/dashboard/Dashboard.html",
      "admin-incidents": "/features/admin/incidents/Incidents.html",
      "admin-performance":
        "/features/admin/performance-reports/PerformanceReports.html",
      "admin-audit": "/features/admin/audit-log/AuditLog.html",
      "admin-checkpoints":
        "/features/admin/checkpoint-management/CheckpointManagement.html",
      "admin-moderation": "/features/admin/moderation-queue/ModerationQueue.html",
      "admin-users": "/features/admin/user-management/UserManagement.html",
      "admin-settings": "/features/admin/system-settings/SystemSettings.html",
      "admin-apimonitor": "/features/admin/api-monitor/APIMonitor.html",
      404: "/features/admin/dashboard/Dashboard.html",
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
