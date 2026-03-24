(function (global) {
  const routing = (global.Routing = global.Routing || {});// create a global object Routing if it doesn't exist, and assign it to the variable routing for easier access. if there is already a Routing object, use that instead.

  routing.config = {
    DEFAULT_ROUTE: "home",
    ROUTE_PATHS: {
      home: "/User/Pages/HomePage/HomePage.html",
      incidents: "/User/Pages/Incidents/IncidentsPage.html",
      "route-planner": "/User/Pages/RoutePlanner/RoutePlannerPage.html",
      "my-reports": "/User/Pages/MyReportsPage/MyReportPage.html",
      alerts: "/User/Pages/AlertsPage/AlertsPage.html",
      404: "/User/Pages/404.html",
    },
    PAGE_NAMESPACE_SELECTORS: {
      home: "#spa-page-home",
      incidents: "#spa-page-incidents",
      "route-planner": "#spa-page-route-planner",
      "my-reports": "#spa-page-myreports",
      alerts: "#spa-page-alerts",
    },
  };
})(window);


// (function (global){})(window); => IIFE (Immediately Invoked Function Expression) patternl, the function will defined and immediately executed, and we can use this function in all the files that are loaded after this file, and we can access the routing.config object in all the files that are loaded after this file. call the function and pass (window) as argument.