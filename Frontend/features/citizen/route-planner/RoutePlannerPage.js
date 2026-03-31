(function (global) {
  const START_COORDS = [31.7683, 35.2137];
  const END_COORDS = [32.0853, 34.7818];
  const API_KEY =
    "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc4ZDVmOGRhNDA2OTQxOGRiNjI0N2E1NWNhMjBjYjllIiwiaCI6Im11cm11cjY0In0=";// !from openrouteservice, for testing purposes only, the info come from the backend and the page is static.

  let plannerLayerGroup = null;

  function buildRouteUrl() {
    return (
      "https://api.openrouteservice.org/v2/directions/driving-car?api_key=" +
      API_KEY +
      "&start=" +
      START_COORDS[1] +
      "," +
      START_COORDS[0] +
      "&end=" +
      END_COORDS[1] +
      "," +
      END_COORDS[0]
    );
  }

  function getMap() {
    return global.AppMapShared?.getMapInstance?.() || null;
  }

  function clearPlannerLayers() {
    if (plannerLayerGroup) {
      plannerLayerGroup.remove();
      plannerLayerGroup = null;
    }
  }

  async function drawRouteOnMap(map) {
    if (!map || typeof global.L === "undefined") return;
    clearPlannerLayers();
    plannerLayerGroup = global.L.layerGroup().addTo(map);

    global.L.marker(START_COORDS)
      .addTo(plannerLayerGroup)
      .bindPopup("مدينة القدس");

    global.L.marker(END_COORDS)
      .addTo(plannerLayerGroup)
      .bindPopup("مدينة تل أبيب");

    try {
      const response = await fetch(buildRouteUrl());
      if (!response.ok) {
        throw new Error("Route request failed with status " + response.status);
      }

      const data = await response.json();
      const routeCoords =
        data?.features?.[0]?.geometry?.coordinates?.map((coord) => [
          coord[1],
          coord[0],
        ]) || [];

      if (!routeCoords.length) {
        throw new Error("No route coordinates received");
      }

      const routeLayer = global.L.polyline(routeCoords, {
        color: "blue",
        weight: 4,
        opacity: 0.7,
      }).addTo(plannerLayerGroup);

      map.fitBounds(routeLayer.getBounds());
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  global.RoutePlannerLogic = {
    drawRouteOnMap,
    clearRouteLayers: clearPlannerLayers,
    getMap,
  };
})(window);

//! this for testing purposes only, the info come from the backend and the page is static.
