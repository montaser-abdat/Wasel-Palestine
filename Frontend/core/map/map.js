(function (global) {
  function initMapWidget() {
    global.AppMapWidgets?.initHomeMapWidget?.();
  }

  function destroyMapWidget() {
    global.AppMapWidgets?.destroyHomeMapWidget?.();
  }

  global.initMapWidget = initMapWidget;
  global.destroyMapWidget = destroyMapWidget;
})(window);
