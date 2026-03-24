(function (global) {
  const MIN_MOVE_METERS = 10;
  const STATIONARY_HOLD_METERS = 12;
  const RECENTER_METERS = 20;
  const MAX_ACCEPTED_ACCURACY_METERS = 80;
  const SMOOTHING_ALPHA = 0.25;

  function distanceInMeters(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadius = 6371000;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  function smoothValue(current, next, alpha) {
    return current + (next - current) * alpha;
  }

  function createHomeLocationController(map) {
    if (!map || typeof global.L === "undefined") return null;

    const state = {
      marker: null,
      circle: null,
      zoomed: false,
      displayPosition: null,
      lastRawPosition: null,
      lastCameraPosition: null,
    };

    function updateMarkerAndCircle(positionState) {
      const latLng = [positionState.lat, positionState.lon];

      if (!state.marker) {
        state.marker = global.L.marker(latLng).addTo(map);
        state.marker.bindPopup("You are here").openPopup();
      } else {
        state.marker.setLatLng(latLng);
      }

      if (!state.circle) {
        state.circle = global.L.circle(latLng, {
          radius: positionState.accuracy,
        }).addTo(map);
      } else {
        state.circle.setLatLng(latLng);
        state.circle.setRadius(positionState.accuracy);
      }
    }

    function onSuccess(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

      if (state.displayPosition && accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
        return;
      }

      const rawPosition = { lat, lon, accuracy };

      if (!state.displayPosition) {
        state.displayPosition = rawPosition;
        state.lastRawPosition = rawPosition;

        updateMarkerAndCircle(state.displayPosition);

        if (!state.zoomed && state.circle) {
          state.zoomed = true;
          map.fitBounds(state.circle.getBounds());
        }

        state.lastCameraPosition = {
          lat: state.displayPosition.lat,
          lon: state.displayPosition.lon,
        };
        return;
      }

      const movedFromDisplay = distanceInMeters(
        state.displayPosition.lat,
        state.displayPosition.lon,
        lat,
        lon,
      );

      const dynamicDriftThreshold = Math.max(
        STATIONARY_HOLD_METERS,
        Math.min(accuracy, state.displayPosition.accuracy) * 0.35,
      );

      if (movedFromDisplay < dynamicDriftThreshold) {
        state.displayPosition = {
          ...state.displayPosition,
          accuracy: smoothValue(state.displayPosition.accuracy, accuracy, 0.2),
        };

        if (state.circle) {
          state.circle.setRadius(state.displayPosition.accuracy);
        }

        state.lastRawPosition = rawPosition;
        return;
      }

      const dynamicMoveThreshold = Math.max(
        MIN_MOVE_METERS,
        Math.min(accuracy, state.displayPosition.accuracy) * 0.25,
      );

      if (movedFromDisplay < dynamicMoveThreshold) {
        state.lastRawPosition = rawPosition;
        return;
      }

      state.displayPosition = {
        lat: smoothValue(state.displayPosition.lat, lat, SMOOTHING_ALPHA),
        lon: smoothValue(state.displayPosition.lon, lon, SMOOTHING_ALPHA),
        accuracy: smoothValue(state.displayPosition.accuracy, accuracy, 0.3),
      };

      updateMarkerAndCircle(state.displayPosition);

      if (!state.zoomed && state.circle) {
        state.zoomed = true;
        map.fitBounds(state.circle.getBounds());
      } else if (state.lastCameraPosition) {
        const cameraShift = distanceInMeters(
          state.lastCameraPosition.lat,
          state.lastCameraPosition.lon,
          state.displayPosition.lat,
          state.displayPosition.lon,
        );

        if (cameraShift >= RECENTER_METERS) {
          map.panTo([state.displayPosition.lat, state.displayPosition.lon], {
            animate: true,
            duration: 0.35,
          });

          state.lastCameraPosition = {
            lat: state.displayPosition.lat,
            lon: state.displayPosition.lon,
          };
        }
      }

      state.lastRawPosition = rawPosition;
    }

    function onError(err) {
      if (err && err.code === 1) {
        console.warn("Location access denied for map.");
        return;
      }

      console.warn("Unable to retrieve location for map.");
    }

    function teardown() {
      if (state.marker) {
        state.marker.remove();
        state.marker = null;
      }

      if (state.circle) {
        state.circle.remove();
        state.circle = null;
      }

      state.zoomed = false;
      state.displayPosition = null;
      state.lastRawPosition = null;
      state.lastCameraPosition = null;
    }

    return {
      onSuccess,
      onError,
      teardown,
    };
  }

  global.AppMapGeolocation = {
    distanceInMeters,
    smoothValue,
    createHomeLocationController,
  };
})(window);
