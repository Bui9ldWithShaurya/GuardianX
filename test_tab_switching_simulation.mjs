import { isValidCoordinate, extractCoordinates, normalizeCoordinates, safeFlyTo, safeSetView, safeSetLatLng, geoManager, DEFAULT_COORDINATES, DEFAULT_EMERGENCY_COORDINATES } from './js/geo.js';

let leafletNaNCalls = 0;
let flyToNaNCalls = 0;
let totalFlyToCalls = 0;
let stopCalls = 0;

// Leaflet mock with strict NaN traps
const mockLeaflet = {
  latLng: (lat, lng) => {
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat === undefined || lng === undefined) {
      leafletNaNCalls++;
      throw new Error(`Invalid LatLng object: (${lat}, ${lng})`);
    }
    return { lat, lng };
  }
};

class MockMap {
  constructor(container) {
    this._container = container;
    this._center = { lat: 37.7895, lng: -122.4014 };
    this._zoom = 15;
  }

  getContainer() {
    return this._container;
  }

  getCenter() {
    return { ...this._center };
  }

  stop() {
    stopCalls++;
  }

  invalidateSize() {}

  setView(coords, zoom) {
    if (Number.isNaN(coords[0]) || Number.isNaN(coords[1])) {
      leafletNaNCalls++;
      throw new Error(`Invalid LatLng object: (${coords[0]}, ${coords[1]})`);
    }
    this._center = { lat: coords[0], lng: coords[1] };
    this._zoom = zoom;
  }

  flyTo(coords, zoom, options) {
    totalFlyToCalls++;
    if (Number.isNaN(coords[0]) || Number.isNaN(coords[1])) {
      flyToNaNCalls++;
      leafletNaNCalls++;
      throw new Error(`Invalid LatLng object: (${coords[0]}, ${coords[1]})`);
    }
    this._center = { lat: coords[0], lng: coords[1] };
    this._zoom = zoom;
  }
}

// 1. Test Geolocation denial fallback safety
console.log("\n--- Scenario 1: GPS Permission Denied ---");
Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: {
    getCurrentPosition: (success, error) => {
      error({ code: 1, message: "User denied Geolocation" });
    }
  },
  configurable: true,
  writable: true
});

const gpsRes = await geoManager.getCurrentPosition();
console.log("GPS Result on denial:", gpsRes);
if (!isValidCoordinate(gpsRes.coords[0], gpsRes.coords[1])) {
  console.error("FAIL: Geolocation denial returned invalid coordinates!");
  process.exit(1);
}
if (gpsRes.coords.some(c => Number.isNaN(c))) {
  console.error("FAIL: Geolocation denial returned NaN!");
  process.exit(1);
}
console.log("PASS: Geolocation denial produced valid numeric coordinates:", gpsRes.coords);

// 2. Test Invalid input coordinates never reach Leaflet
console.log("\n--- Scenario 2: Strict Coordinate Rejection before Leaflet ---");
const mapContainer = { offsetWidth: 800, offsetHeight: 600 };
const testMap = new MockMap(mapContainer);

const invalidInputs = [
  [NaN, NaN],
  [undefined, undefined],
  [null, null],
  ["", ""],
  ["invalid", "invalid"],
  [91, 0],
  [-91, 0],
  [0, 181],
  [0, -181],
  [Infinity, 0],
  [0, -Infinity],
  [{ lat: NaN, lng: NaN }, undefined],
  [[NaN, NaN], undefined]
];

for (const [lat, lng] of invalidInputs) {
  const result = safeFlyTo(testMap, lat, lng, 15);
  if (result !== false) {
    console.error(`FAIL: safeFlyTo did not reject invalid coordinate: ${JSON.stringify(lat)}, ${JSON.stringify(lng)}`);
    process.exit(1);
  }
}
if (flyToNaNCalls > 0 || leafletNaNCalls > 0) {
  console.error(`FAIL: Leaflet received ${leafletNaNCalls} NaN calls!`);
  process.exit(1);
}
console.log(`PASS: All ${invalidInputs.length} invalid inputs strictly rejected. Zero reached Leaflet.`);

// 3. Test Tab Switching 30+ times simulation
console.log("\n--- Scenario 3: 30 Tab Switches Simulation ---");
const tabs = ['home', 'monitoring', 'safe-ride', 'safety-map', 'emergency', 'profile'];
let simulatedLastValidCoords = [...DEFAULT_COORDINATES];

for (let cycle = 1; cycle <= 30; cycle++) {
  const tab = tabs[cycle % tabs.length];
  
  if (tab === 'safety-map') {
    // Container becomes visible
    mapContainer.offsetWidth = 800;
    mapContainer.offsetHeight = 600;

    testMap.stop();
    testMap.invalidateSize();

    const target = (Array.isArray(simulatedLastValidCoords) && isValidCoordinate(simulatedLastValidCoords[0], simulatedLastValidCoords[1]))
      ? simulatedLastValidCoords
      : DEFAULT_COORDINATES;

    const flown = safeFlyTo(testMap, target[0], target[1], 15.5, { duration: 0.8 }, DEFAULT_COORDINATES);
    if (!flown) {
      console.error(`FAIL: safeFlyTo failed on visible safety-map in cycle ${cycle}`);
      process.exit(1);
    }
  } else {
    // Container is hidden (display: none -> 0x0)
    mapContainer.offsetWidth = 0;
    mapContainer.offsetHeight = 0;

    // SafetyMapEngine.updateViewContext stops active Leaflet animation
    testMap.stop();

    // Verify that attempting to flyTo on hidden container is safely blocked
    const flown = safeFlyTo(testMap, simulatedLastValidCoords[0], simulatedLastValidCoords[1], 15.5);
    if (flown !== false) {
      console.error(`FAIL: safeFlyTo should return false on hidden container in cycle ${cycle}`);
      process.exit(1);
    }
  }
}

if (leafletNaNCalls > 0) {
  console.error(`FAIL: Leaflet received ${leafletNaNCalls} NaN LatLng calls during tab switches!`);
  process.exit(1);
}

console.log(`PASS: 30 tab switches completed successfully.`);
console.log(`  Total map.flyTo calls: ${totalFlyToCalls}`);
console.log(`  Total map.stop calls: ${stopCalls}`);
console.log(`  Total Leaflet NaN crashes: ${leafletNaNCalls} (ZERO)`);

// 4. Test marker updates with safeSetLatLng
console.log("\n--- Scenario 4: Marker Update Protection ---");
let markerSetLatLngCalls = 0;
const mockMarker = {
  setLatLng: (coords) => {
    markerSetLatLngCalls++;
    if (Number.isNaN(coords[0]) || Number.isNaN(coords[1])) {
      leafletNaNCalls++;
      throw new Error(`Invalid LatLng object: (${coords[0]}, ${coords[1]})`);
    }
  }
};

safeSetLatLng(mockMarker, NaN, NaN); // Rejected
safeSetLatLng(mockMarker, undefined, undefined); // Rejected
safeSetLatLng(mockMarker, 37.7895, -122.4014); // Valid
if (markerSetLatLngCalls !== 1) {
  console.error(`FAIL: marker should only have been set once, got ${markerSetLatLngCalls}`);
  process.exit(1);
}
console.log("PASS: safeSetLatLng strictly protected marker from NaN.");

console.log("\n=======================================================");
console.log("ALL MAP, GEO & TAB SWITCHING VERIFICATION TESTS PASSED!");
console.log("=======================================================");
