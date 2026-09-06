import { isValidCoordinate, extractCoordinates, normalizeCoordinates, safeFlyTo, safeSetView, DEFAULT_COORDINATES } from './js/geo.js';

const testCases = [
  [37.7749, -122.4194, true],
  ['37.7749', '-122.4194', true],
  [0, 0, true],
  [-90, -180, true],
  [90, 180, true],
  [NaN, NaN, false],
  [undefined, undefined, false],
  [null, null, false],
  ['', '', false],
  [91, 0, false],
  [-91, 0, false],
  [0, 181, false],
  [0, -181, false],
  [Infinity, 0, false],
  [0, -Infinity, false],
  ['abc', 'def', false],
  [[37.77, -122.41], undefined, true],
  [{latitude: 37.77, longitude: -122.41}, undefined, true],
  [{lat: 37.77, lng: -122.41}, undefined, true],
  [{lat: NaN, lng: NaN}, undefined, false],
];

let failed = 0;
testCases.forEach(([lat, lng, expected], i) => {
  const actual = isValidCoordinate(lat, lng);
  if (actual !== expected) {
    console.error(`Case ${i} FAILED: lat=${JSON.stringify(lat)}, lng=${JSON.stringify(lng)} expected=${expected} got=${actual}`);
    failed++;
  }
});

const ext1 = extractCoordinates(NaN, NaN);
const ext2 = extractCoordinates(undefined, undefined);
const ext3 = extractCoordinates("37.77", "-122.41");
console.log('extractCoordinates(NaN, NaN) ->', ext1);
console.log('extractCoordinates(undefined, undefined) ->', ext2);
console.log('extractCoordinates("37.77", "-122.41") ->', ext3);

if (!isValidCoordinate(ext1[0], ext1[1]) || !isValidCoordinate(ext2[0], ext2[1]) || !isValidCoordinate(ext3[0], ext3[1])) {
  console.error('extractCoordinates returned invalid coordinates!');
  failed++;
}

// Test safeFlyTo with mock map
let flyToCalledWith = null;
const mockMap = {
  _container: { offsetWidth: 800, offsetHeight: 600 },
  getCenter: () => ({ lat: 37.78, lng: -122.40 }),
  stop: () => {},
  flyTo: (coords, zoom, options) => {
    flyToCalledWith = coords;
  }
};

// 1. Valid coords flyTo
safeFlyTo(mockMap, [37.7895, -122.4014], 16);
if (!flyToCalledWith || flyToCalledWith[0] !== 37.7895) {
  console.error('safeFlyTo with valid coords failed');
  failed++;
}

// 2. NaN coords must NEVER call map.flyTo
flyToCalledWith = null;
safeFlyTo(mockMap, [NaN, NaN], 16);
if (flyToCalledWith !== null) {
  console.error('CRITICAL ERROR: safeFlyTo called map.flyTo with NaN coordinates!');
  failed++;
}

// 3. Hidden container (offsetWidth == 0) must NEVER call map.flyTo
mockMap._container = { offsetWidth: 0, offsetHeight: 0 };
flyToCalledWith = null;
safeFlyTo(mockMap, [37.7895, -122.4014], 16);
if (flyToCalledWith !== null) {
  console.error('CRITICAL ERROR: safeFlyTo called map.flyTo on hidden container!');
  failed++;
}

if (failed === 0) {
  console.log('=== ALL COORDINATE & LEAFLET SAFETY UNIT TESTS PASSED ===');
} else {
  console.error(`${failed} unit tests failed`);
  process.exit(1);
}
