(function (global) {
  async function initRoutePlannerPage() {
    const map = global.RoutePlannerLogic?.getMap?.();
    if (!map) return;

    await global.RoutePlannerLogic?.drawRouteOnMap?.(map);
  }

  function destroyRoutePlannerPage() {
    global.RoutePlannerLogic?.clearRouteLayers?.();
  }

  global.RoutePlannerPage = {
    init: initRoutePlannerPage,
    destroy: destroyRoutePlannerPage,
  };

  if (global.location.hash === "#route-planner") {
    initRoutePlannerPage();
  }
})(window);
