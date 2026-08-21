// ================== CONFIG ==================
const APP_CONFIG = {
  GEOLOCATION_INTERVAL_MS: 5 * 60 * 1000,
  HISTORY_OVERLAY_COUNT: 5,
  MOUSE_COORDINATES_DECIMALS: 5,
  CLICK_COORDINATE_MARKER: true,

  // Travel recording: 1 point/minute by default = 480 points over 8 hours.
  TRAVEL_DEFAULT_FREQUENCY_MS: 60 * 1000,
  TRAVEL_MIN_FREQUENCY_MS: 30 * 1000,
  TRAVEL_MAX_FREQUENCY_MS: 30 * 60 * 1000,

  // Add explicit parent origins here for cross-origin iframe usage.
  TRAVEL_ALLOWED_MESSAGE_ORIGINS: [
    window.location.origin
  ],

  LABEL_PREFIXES: {
    continents: '🌍 ',
    countries: '🗺️ ',
    capitals: '🏙️ ',
    mountains: '🏔️ ',
    seas: '🌊 '
  },

  LABEL_LAYERS: {
    continents: { enabled: true, minZoom: 2, maxZoom: 3 },
    seas: { enabled: true, minZoom: 6, maxZoom: 10 },
    countries: { enabled: true, minZoom: 6, maxZoom: 10 },
    mountains: { enabled: true, minZoom: 6, maxZoom: 10 },
    capitals: { enabled: true, minZoom: 5, maxZoom: 10 }
  }
};


// ================== IndexedDB Layer ==================
const DB_NAME = 'PositionDB';
const DB_VERSION = 3;

const STORE_POSITIONS = 'positions';
const STORE_SETTINGS = 'settings';
const STORE_TRAVELS = 'travels';
const STORE_TRAVEL_POINTS = 'travelPoints';

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => reject(event.target.error);

    request.onsuccess = event => {
      db = event.target.result;

      db.onversionchange = () => {
        db.close();
        db = null;
      };

      resolve(db);
    };

    request.onupgradeneeded = event => {
      db = event.target.result;

      // Preserve existing positions store.
      if (!db.objectStoreNames.contains(STORE_POSITIONS)) {
        db.createObjectStore(STORE_POSITIONS, {
          keyPath: 'timestamp'
        });
      }

      // Preserve existing settings store.
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, {
          keyPath: 'key'
        });
      }

      // One record per travel, keyed by unique travel name.
      if (!db.objectStoreNames.contains(STORE_TRAVELS)) {
        const travelStore = db.createObjectStore(STORE_TRAVELS, {
          keyPath: 'name'
        });

        travelStore.createIndex(
          'date',
          'date',
          { unique: false }
        );

        travelStore.createIndex(
          'startTimestamp',
          'startTimestamp',
          { unique: false }
        );
      }

      // Every geolocation point is linked to its travel.
      if (!db.objectStoreNames.contains(STORE_TRAVEL_POINTS)) {
        const pointStore = db.createObjectStore(STORE_TRAVEL_POINTS, {
          keyPath: 'id',
          autoIncrement: true
        });

        pointStore.createIndex(
          'travelName',
          'travelName',
          { unique: false }
        );

        pointStore.createIndex(
          'timestamp',
          'timestamp',
          { unique: false }
        );

        pointStore.createIndex(
          'travelTimestamp',
          ['travelName', 'timestamp'],
          { unique: false }
        );
      }
    };
  });
}


// ================== Positions API ==================

function addPosition(position) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSITIONS, 'readwrite');
      const store = tx.objectStore(STORE_POSITIONS);
      const req = store.put(position);

      req.onsuccess = () => resolve();
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function getAllPositions() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSITIONS, 'readonly');
      const store = tx.objectStore(STORE_POSITIONS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function clearPositions() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSITIONS, 'readwrite');
      const store = tx.objectStore(STORE_POSITIONS);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = ev => reject(ev.target.error);
    });
  });
}


// ================== Settings API ==================

function setSetting(key, value) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.put({ key, value });

      req.onsuccess = () => resolve();
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function getSetting(key) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ? req.result.value : null);
      };

      req.onerror = ev => reject(ev.target.error);
    });
  });
}


// ================== Travel IndexedDB API ==================

function saveTravel(travel) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRAVELS, 'readwrite');
      const store = tx.objectStore(STORE_TRAVELS);

      const req = store.put(travel);

      req.onsuccess = () => resolve(travel);
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function getTravel(name) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRAVELS, 'readonly');
      const store = tx.objectStore(STORE_TRAVELS);

      const req = store.get(name);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function getAllTravels() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRAVELS, 'readonly');
      const store = tx.objectStore(STORE_TRAVELS);

      const req = store.getAll();

      req.onsuccess = () => {
        const result = req.result || [];

        result.sort(
          (a, b) =>
            (b.startTimestamp || 0) -
            (a.startTimestamp || 0)
        );

        resolve(result);
      };

      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function addTravelPoint(point) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        STORE_TRAVEL_POINTS,
        'readwrite'
      );

      const store = tx.objectStore(STORE_TRAVEL_POINTS);
      const req = store.add(point);

      req.onsuccess = () => {
        resolve({
          ...point,
          id: req.result
        });
      };

      req.onerror = ev => reject(ev.target.error);
    });
  });
}

function getTravelPoints(name) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        STORE_TRAVEL_POINTS,
        'readonly'
      );

      const store = tx.objectStore(STORE_TRAVEL_POINTS);
      const index = store.index('travelName');

      const req = index.getAll(
        IDBKeyRange.only(name)
      );

      req.onsuccess = () => {
        const points = req.result || [];

        points.sort(
          (a, b) => a.timestamp - b.timestamp
        );

        resolve(points);
      };

      req.onerror = ev => reject(ev.target.error);
    });
  });
}


// ================== Travel Runtime ==================

let activeTravel = null;
let travelInterval = null;
let travelRecordingInProgress = false;

let displayedTravelLayer = null;
let displayedTravelMarkers = [];

function normaliseTravelFrequency(value) {
  let frequency = Number(value);

  if (!Number.isFinite(frequency)) {
    frequency =
      APP_CONFIG.TRAVEL_DEFAULT_FREQUENCY_MS;
  }

  return Math.min(
    APP_CONFIG.TRAVEL_MAX_FREQUENCY_MS,
    Math.max(
      APP_CONFIG.TRAVEL_MIN_FREQUENCY_MS,
      Math.round(frequency)
    )
  );
}

function getTravelGeolocationOptions(options = {}) {
  return {
    enableHighAccuracy:
      options.enableHighAccuracy !== false,

    timeout:
      Number.isFinite(Number(options.timeout))
        ? Math.max(1000, Number(options.timeout))
        : 20000,

    maximumAge:
      Number.isFinite(Number(options.maximumAge))
        ? Math.max(0, Number(options.maximumAge))
        : 10000
  };
}

function getCurrentGeolocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          'Geolocation is not supported by this browser.'
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      getTravelGeolocationOptions(options)
    );
  });
}

async function recordTravelPoint() {
  if (!activeTravel) return null;

  // Prevent overlapping GPS calls when one request takes
  // longer than the configured interval.
  if (travelRecordingInProgress) return null;

  travelRecordingInProgress = true;

  try {
    const travelName = activeTravel.name;
    const position = await getCurrentGeolocation(
      activeTravel.geolocationOptions || {}
    );

    // Travel may have ended while GPS permission/request
    // was pending.
    if (
      !activeTravel ||
      activeTravel.name !== travelName
    ) {
      return null;
    }

    const timestamp =
      Number(position.timestamp) || Date.now();

    const point = {
      travelName,
      timestamp,

      latitude: position.coords.latitude,
      longitude: position.coords.longitude,

      accuracy:
        position.coords.accuracy ?? null,

      altitude:
        position.coords.altitude ?? null,

      altitudeAccuracy:
        position.coords.altitudeAccuracy ?? null,

      heading:
        position.coords.heading ?? null,

      speed:
        position.coords.speed ?? null
    };

    const savedPoint = await addTravelPoint(point);

    activeTravel.lastPoint = {
      latitude: point.latitude,
      longitude: point.longitude,
      timestamp: point.timestamp
    };

    activeTravel.pointCount =
      (activeTravel.pointCount || 0) + 1;

    await saveTravel(activeTravel);

    await setSetting(
      'currentTravel',
      activeTravel
    );

    // Preserve existing map/current-position behaviour,
    // but do not duplicate the travel point in travelPoints.
    updatePosition(
      point.latitude,
      point.longitude,
      point.timestamp
    );

    return savedPoint;
  } finally {
    travelRecordingInProgress = false;
  }
}

function scheduleTravelRecording() {
  if (travelInterval) {
    clearInterval(travelInterval);
    travelInterval = null;
  }

  if (!activeTravel) return;

  const frequency =
    normaliseTravelFrequency(
      activeTravel.frequencyMs
    );

  activeTravel.frequencyMs = frequency;

  travelInterval = setInterval(() => {
    recordTravelPoint().catch(err => {
      console.error(
        'Travel geolocation error:',
        err
      );
    });
  }, frequency);
}

async function startTravel(
  name,
  options = {}
) {
  name = String(name || '').trim();

  if (!name) {
    throw new Error(
      'A travel name is required.'
    );
  }

  if (activeTravel) {
    throw new Error(
      `Travel "${activeTravel.name}" is already active.`
    );
  }

  const existing = await getTravel(name);

  if (existing) {
    throw new Error(
      `Travel "${name}" already exists.`
    );
  }

  const now = Date.now();

  const frequencyMs =
    normaliseTravelFrequency(
      options.frequencyMs ??
      options.frequency
    );

  const geolocationOptions =
    getTravelGeolocationOptions(options);

  activeTravel = {
    name,

    date: new Date(now)
      .toISOString()
      .slice(0, 10),

    startTimestamp: now,
    endTimestamp: null,

    start: null,
    end: null,

    durationMs: null,

    frequencyMs,

    pointCount: 0,

    status: 'running',

    geolocationOptions,

    createdAt: now,
    updatedAt: now
  };

  await saveTravel(activeTravel);

  await setSetting(
    'currentTravel',
    activeTravel
  );

  // Record the starting location immediately.
  try {
    const firstPoint =
      await recordTravelPoint();

    if (firstPoint && activeTravel) {
      activeTravel.start = {
        latitude: firstPoint.latitude,
        longitude: firstPoint.longitude,
        timestamp: firstPoint.timestamp
      };

      activeTravel.startTimestamp =
        firstPoint.timestamp;

      activeTravel.date =
        new Date(firstPoint.timestamp)
          .toISOString()
          .slice(0, 10);

      activeTravel.updatedAt = Date.now();

      await saveTravel(activeTravel);

      await setSetting(
        'currentTravel',
        activeTravel
      );
    }
  } catch (err) {
    // Travel remains active even if first GPS request fails.
    console.error(
      'Initial travel position error:',
      err
    );
  }

  scheduleTravelRecording();

  return {
    ...activeTravel
  };
}

async function endTravel(name = null) {
  if (!activeTravel) {
    throw new Error(
      'No travel is currently active.'
    );
  }

  if (
    name &&
    String(name).trim() !== activeTravel.name
  ) {
    throw new Error(
      `Active travel is "${activeTravel.name}".`
    );
  }

  if (travelInterval) {
    clearInterval(travelInterval);
    travelInterval = null;
  }

  const endingTravel = activeTravel;

  // Try to capture the final location.
  try {
    const finalPoint =
      await recordTravelPoint();

    if (finalPoint && activeTravel) {
      activeTravel.end = {
        latitude: finalPoint.latitude,
        longitude: finalPoint.longitude,
        timestamp: finalPoint.timestamp
      };

      activeTravel.endTimestamp =
        finalPoint.timestamp;
    }
  } catch (err) {
    console.error(
      'Final travel position error:',
      err
    );
  }

  if (!activeTravel) {
    activeTravel = endingTravel;
  }

  const now = Date.now();

  if (!activeTravel.endTimestamp) {
    activeTravel.endTimestamp = now;
  }

  if (
    !activeTravel.end &&
    activeTravel.lastPoint
  ) {
    activeTravel.end = {
      ...activeTravel.lastPoint
    };
  }

  activeTravel.durationMs =
    Math.max(
      0,
      activeTravel.endTimestamp -
      activeTravel.startTimestamp
    );

  activeTravel.status = 'completed';
  activeTravel.updatedAt = now;

  const completedTravel = {
    ...activeTravel
  };

  await saveTravel(completedTravel);

  activeTravel = null;

  await setSetting(
    'currentTravel',
    null
  );

  return completedTravel;
}

async function resumeCurrentTravel() {
  const stored =
    await getSetting('currentTravel');

  if (
    !stored ||
    stored.status !== 'running' ||
    !stored.name
  ) {
    activeTravel = null;
    return null;
  }

  const travel =
    await getTravel(stored.name);

  if (
    !travel ||
    travel.status !== 'running'
  ) {
    await setSetting(
      'currentTravel',
      null
    );

    activeTravel = null;
    return null;
  }

  activeTravel = {
    ...travel,
    frequencyMs:
      normaliseTravelFrequency(
        travel.frequencyMs
      )
  };

  // Persist normalized state.
  await setSetting(
    'currentTravel',
    activeTravel
  );

  // App/browser has reopened: obtain a point immediately.
  recordTravelPoint().catch(err => {
    console.error(
      'Resumed travel position error:',
      err
    );
  });

  scheduleTravelRecording();

  return {
    ...activeTravel
  };
}

function getTravelStatus() {
  return activeTravel
    ? {
        active: true,
        travel: {
          ...activeTravel
        }
      }
    : {
        active: false,
        travel: null
      };
}


// ================== Travel Deletion ==================

async function deleteTravel(name) {
  name = String(name || '').trim();

  if (!name) {
    throw new Error(
      'A travel name is required.'
    );
  }

  if (
    activeTravel &&
    activeTravel.name === name
  ) {
    throw new Error(
      'End the active travel before deleting it.'
    );
  }

  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(
      [
        STORE_TRAVELS,
        STORE_TRAVEL_POINTS
      ],
      'readwrite'
    );

    const travelStore =
      tx.objectStore(STORE_TRAVELS);

    const pointStore =
      tx.objectStore(STORE_TRAVEL_POINTS);

    const index =
      pointStore.index('travelName');

    let deletedPoints = 0;

    const cursorRequest =
      index.openCursor(
        IDBKeyRange.only(name)
      );

    cursorRequest.onerror = event => {
      reject(event.target.error);
    };

    cursorRequest.onsuccess = event => {
      const cursor =
        event.target.result;

      if (cursor) {
        cursor.delete();
        deletedPoints++;
        cursor.continue();
      } else {
        travelStore.delete(name);
      }
    };

    tx.oncomplete = () => {
      if (
        displayedTravelLayer &&
        displayedTravelLayer.travelName === name
      ) {
        clearDisplayedTravel();
      }

      resolve({
        name,
        deleted: true,
        deletedPoints
      });
    };

    tx.onerror = event => {
      reject(
        event.target.error ||
        tx.error
      );
    };

    tx.onabort = event => {
      reject(
        event.target.error ||
        tx.error
      );
    };
  });
}


// ================== Sensors & Wake Lock ==================

let lastOrientation = null;
let lastMotion = null;
let batteryStatus = null;

// Battery
if (navigator.getBattery) {
  navigator.getBattery().then(b => {
    batteryStatus = b;
  });
}

// Wake Lock
let wakeLock = null;

async function requestScreenWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock =
        await navigator.wakeLock.request(
          'screen'
        );

      wakeLock.addEventListener?.(
        'release',
        () => {}
      );
    }
  } catch (e) {
    // Not supported or denied.
  }
}

async function releaseScreenWakeLock() {
  try {
    await wakeLock?.release();
  } catch (e) {
    // Ignore.
  }

  wakeLock = null;
}


// ================== Orientation ==================

function handleOrientation(event) {
  lastOrientation = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  };

  const compassOverlay =
    document.getElementById(
      'compassOverlay'
    );

  const heading =
    Math.round(event.alpha || 0);

  if (compassOverlay) {
    compassOverlay.style.transform =
      `rotate(${-heading}deg)`;

    compassOverlay.textContent =
      `${heading}°`;
  }

  localStorage.setItem(
    'compassValue',
    `${heading}°`
  );
}


// ================== Motion ==================

function handleMotion(event) {
  lastMotion = {
    acceleration: event.acceleration,
    rotationRate: event.rotationRate,
    interval: event.interval
  };
}

function startSensors() {
  window.addEventListener(
    'deviceorientation',
    handleOrientation
  );

  window.addEventListener(
    'devicemotion',
    handleMotion
  );
}

function stopSensors() {
  window.removeEventListener(
    'deviceorientation',
    handleOrientation
  );

  window.removeEventListener(
    'devicemotion',
    handleMotion
  );

  const compassOverlay =
    document.getElementById(
      'compassOverlay'
    );

  localStorage.setItem(
    'compassValue',
    '--°'
  );

  if (compassOverlay) {
    compassOverlay.textContent = '--°';
    compassOverlay.style.transform =
      'rotate(0deg)';
  }
}


// ================== Map & Layers ==================

const map = L.map('map', {
  worldCopyJump: true,
  minZoom: 2,
  maxZoom: 18,
  maxBounds: [
    [-85, -180],
    [85, 180]
  ],
  maxBoundsViscosity: 1.0
}).setView([20, 0], 2);

const mouseCoordsOverlay =
  L.control({
    position: 'bottomleft'
  });

mouseCoordsOverlay.onAdd = function () {
  const div = L.DomUtil.create(
    'div',
    'mouse-coords-overlay'
  );

  div.textContent =
    'Lat: --, Lng: --';

  return div;
};

mouseCoordsOverlay.addTo(map);

let clickCoordinateMarker = null;

map.on('click', e => {
  if (
    !APP_CONFIG.CLICK_COORDINATE_MARKER
  ) {
    return;
  }

  if (clickCoordinateMarker) {
    map.removeLayer(
      clickCoordinateMarker
    );
  }

  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  clickCoordinateMarker =
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `<strong>COORDINATES</strong><br>` +
        `Lat: ${lat.toFixed(
          APP_CONFIG.MOUSE_COORDINATES_DECIMALS
        )}<br>` +
        `Lng: ${lng.toFixed(
          APP_CONFIG.MOUSE_COORDINATES_DECIMALS
        )}`
      )
      .openPopup();
});


// Persistent polygon layer for countries.
let countriesGeoJsonLayer = null;


// Dynamic label layer groups.
const labelLayers = {
  continents:
    L.layerGroup().addTo(map),

  countries:
    L.layerGroup().addTo(map),

  capitals:
    L.layerGroup().addTo(map),

  mountains:
    L.layerGroup().addTo(map),

  seas:
    L.layerGroup().addTo(map)
};


// Data stores.
let continentsData = [];
let countriesLabelData = [];
let capitalsData = [];
let mountainsData = [];
let seasData = [];


// ================== Map Helpers ==================

function isLayerVisible(
  layerKey,
  zoom
) {
  const cfg =
    APP_CONFIG.LABEL_LAYERS[
      layerKey
    ];

  if (!cfg || !cfg.enabled) {
    return false;
  }

  if (
    typeof cfg.minZoom === 'number' &&
    zoom < cfg.minZoom
  ) {
    return false;
  }

  if (
    typeof cfg.maxZoom === 'number' &&
    zoom > cfg.maxZoom
  ) {
    return false;
  }

  return true;
}

function clearDynamicLabelLayers() {
  Object.values(
    labelLayers
  ).forEach(layer => {
    layer.clearLayers();
  });
}

function addTextLabel(
  lat,
  lng,
  text,
  className,
  targetLayer,
  prefix = ''
) {
  if (
    lat == null ||
    lng == null ||
    !text
  ) {
    return;
  }

  L.marker(
    [lat, lng],
    {
      interactive: false,
      keyboard: false,

      icon: L.divIcon({
        className,
        html: `${prefix}${text}`
      })
    }
  ).addTo(targetLayer);
}

function refreshDynamicLabels() {
  const zoom = map.getZoom();
  const bounds = map.getBounds();

  clearDynamicLabelLayers();

  if (
    isLayerVisible(
      'continents',
      zoom
    )
  ) {
    continentsData.forEach(item => {
      const [name, lat, lng] =
        item;

      if (
        bounds.contains([lat, lng])
      ) {
        addTextLabel(
          lat,
          lng,
          name,
          'continent-label',
          labelLayers.continents,
          APP_CONFIG
            .LABEL_PREFIXES
            .continents
        );
      }
    });
  }

  if (
    isLayerVisible(
      'countries',
      zoom
    )
  ) {
    countriesLabelData.forEach(
      item => {
        const [name, lat, lng] =
          item;

        if (
          bounds.contains(
            [lat, lng]
          )
        ) {
          addTextLabel(
            lat,
            lng,
            name,
            'country-label',
            labelLayers.countries,
            APP_CONFIG
              .LABEL_PREFIXES
              .countries
          );
        }
      }
    );
  }

  if (
    isLayerVisible(
      'capitals',
      zoom
    )
  ) {
    capitalsData.forEach(item => {
      const [
        name,
        iso2,
        lat,
        lng
      ] = item;

      if (
        bounds.contains([lat, lng])
      ) {
        addTextLabel(
          lat,
          lng,
          name,
          'capital-label',
          labelLayers.capitals,
          APP_CONFIG
            .LABEL_PREFIXES
            .capitals
        );
      }
    });
  }

  if (
    isLayerVisible(
      'mountains',
      zoom
    )
  ) {
    mountainsData.forEach(item => {
      const [
        name,
        region,
        lat,
        lng
      ] = item;

      if (
        bounds.contains([lat, lng])
      ) {
        addTextLabel(
          lat,
          lng,
          name,
          'mountain-label',
          labelLayers.mountains,
          APP_CONFIG
            .LABEL_PREFIXES
            .mountains
        );
      }
    });
  }

  if (
    isLayerVisible(
      'seas',
      zoom
    )
  ) {
    seasData.forEach(item => {
      const [
        name,
        type,
        lat,
        lng
      ] = item;

      if (
        bounds.contains([lat, lng])
      ) {
        addTextLabel(
          lat,
          lng,
          name,
          'sea-label',
          labelLayers.seas,
          APP_CONFIG
            .LABEL_PREFIXES
            .seas
        );
      }
    });
  }
}


// ================== Existing Data Loading ==================

fetch('countries.geojson')
  .then(r => r.json())
  .then(data => {
    countriesGeoJsonLayer =
      L.geoJSON(data, {
        style: {
          color: '#3388ff',
          weight: 1,
          fillOpacity: 0.2
        }
      }).addTo(map);

    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading countries.geojson:',
      err
    )
  );

fetch('continents.json')
  .then(r => r.json())
  .then(data => {
    continentsData = data || [];
    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading continents.json:',
      err
    )
  );

fetch('countries.json')
  .then(r => r.json())
  .then(data => {
    countriesLabelData =
      (data || []).map(item => {
        const [
          name,
          iso2,
          lat,
          lng
        ] = item;

        return [name, lat, lng];
      });

    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading countries.json:',
      err
    )
  );

fetch('capitals.json')
  .then(r => r.json())
  .then(data => {
    capitalsData = data || [];
    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading capitals.json:',
      err
    )
  );

fetch('major_mountain_ranges.json')
  .then(r => r.json())
  .then(data => {
    mountainsData = data || [];
    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading major_mountain_ranges.json:',
      err
    )
  );

fetch('seas_and_major_marine_regions.json')
  .then(r => r.json())
  .then(data => {
    seasData = data || [];
    refreshDynamicLabels();
  })
  .catch(err =>
    console.error(
      'Error loading seas_and_major_marine_regions.json:',
      err
    )
  );

map.on(
  'zoomend moveend',
  refreshDynamicLabels
);


// ================== Markers & overlays ==================

let currentMarker = null;
let historyMarkers = [];


// ================== Travel Map Rendering ==================

function clearDisplayedTravel() {
  if (displayedTravelLayer) {
    map.removeLayer(
      displayedTravelLayer
    );

    displayedTravelLayer = null;
  }

  displayedTravelMarkers.forEach(
    marker => marker.remove()
  );

  displayedTravelMarkers = [];
}

async function openTravel(name) {
  name = String(name || '').trim();

  if (!name) {
    throw new Error(
      'A travel name is required.'
    );
  }

  const travel =
    await getTravel(name);

  if (!travel) {
    throw new Error(
      `Travel "${name}" was not found.`
    );
  }

  const points =
    await getTravelPoints(name);

  clearDisplayedTravel();

  if (!points.length) {
    return {
      travel,
      points: []
    };
  }

  // getTravelPoints already sorts ASC by timestamp.
  const orderedPoints =
    points.map(
      (point, index, all) => {
        const previous =
          index > 0
            ? all[index - 1]
            : null;

        const next =
          index < all.length - 1
            ? all[index + 1]
            : null;

        return {
          ...point,

          previousTimestamp:
            previous
              ? previous.timestamp
              : null,

          nextTimestamp:
            next
              ? next.timestamp
              : null
        };
      }
    );

  const latLngs =
    orderedPoints.map(point => [
      point.latitude,
      point.longitude
    ]);

  const polyline =
    L.polyline(latLngs)
      .addTo(map);

  // Attach travel name without changing Leaflet APIs.
  polyline.travelName = name;

  displayedTravelLayer =
    polyline;

  orderedPoints.forEach(
    (point, index) => {
      const previous =
        index > 0
          ? orderedPoints[index - 1]
          : null;

      const next =
        index <
        orderedPoints.length - 1
          ? orderedPoints[index + 1]
          : null;

      const marker =
        L.circleMarker(
          [
            point.latitude,
            point.longitude
          ],
          {
            radius: 5,
            weight: 2,
            fillOpacity: 0.8
          }
        )
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(
              name
            )}</strong><br>` +

            `Point: ${
              index + 1
            } / ${
              orderedPoints.length
            }<br>` +

            `Current: ${escapeHtml(
              new Date(
                point.timestamp
              ).toLocaleString()
            )}<br>` +

            `Previous: ${
              previous
                ? escapeHtml(
                    new Date(
                      previous.timestamp
                    ).toLocaleString()
                  )
                : 'START'
            }<br>` +

            `Next: ${
              next
                ? escapeHtml(
                    new Date(
                      next.timestamp
                    ).toLocaleString()
                  )
                : 'END'
            }<br>` +

            `Latitude: ${
              point.latitude
            }<br>` +

            `Longitude: ${
              point.longitude
            }`
          );

      displayedTravelMarkers.push(
        marker
      );
    }
  );

  if (latLngs.length === 1) {
    map.setView(
      latLngs[0],
      15
    );
  } else {
    map.fitBounds(
      polyline.getBounds(),
      {
        padding: [30, 30]
      }
    );
  }

  return {
    travel,
    points: orderedPoints
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


// ================== Offline Navigation State ==================

let offlineNavInterval = null;
let offlineNavActive = false;

function updateOfflineNavUI(active) {
  offlineNavActive = active;

  const statusDiv =
    document.getElementById(
      'offlineNavStatus'
    );

  const btn =
    document.getElementById(
      'offlineNavBtn'
    );

  if (statusDiv) {
    statusDiv.textContent =
      active
        ? 'Navigation ON'
        : 'Navigation OFF';

    statusDiv.style.backgroundColor =
      active
        ? 'rgba(0, 160, 0, 0.85)'
        : 'rgba(180, 0, 0, 0.85)';
  }

  if (btn) {
    btn.textContent =
      active
        ? 'Offline Navigation: ON'
        : 'Offline Navigation: OFF';

    btn.style.backgroundColor =
      active
        ? '#146314'
        : '#222';
  }
}


// Existing 5-minute navigation remains unchanged.
function startOfflineNavigation() {
  if (offlineNavInterval) {
    clearInterval(
      offlineNavInterval
    );
  }

  updateOfflineNavUI(true);

  setSetting(
    'offlineNavActive',
    true
  ).catch(() => {});

  requestGeolocationAndUpdate();

  offlineNavInterval =
    setInterval(() => {
      requestGeolocationAndUpdate();
    }, APP_CONFIG.GEOLOCATION_INTERVAL_MS);
}

function stopOfflineNavigation() {
  if (offlineNavInterval) {
    clearInterval(
      offlineNavInterval
    );

    offlineNavInterval = null;
  }

  updateOfflineNavUI(false);

  setSetting(
    'offlineNavActive',
    false
  ).catch(() => {});
}


// ================== Position update & overlays ==================

function updatePosition(
  lat,
  lng,
  timestamp
) {
  map.setView(
    [lat, lng],
    13
  );

  if (currentMarker) {
    currentMarker.remove();
  }

  const tsStr =
    new Date(
      timestamp
    ).toLocaleString();

  currentMarker =
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `<strong>HERE</strong><br>` +
        `Latitude: ${lat}<br>` +
        `Longitude: ${lng}<br>` +
        `Timestamp: ${tsStr}`
      )
      .openPopup();

  const historyMarker =
    L.circleMarker(
      [lat, lng],
      {
        radius: 4,
        color: '#FF0000',
        fillOpacity: 0.8
      }
    ).addTo(map);

  historyMarkers.push(
    historyMarker
  );

  refreshDynamicLabels();

  const record = {
    latitude: lat,
    longitude: lng,
    timestamp
  };

  addPosition(record)
    .then(() =>
      refreshLatestPositionsOverlay()
    )
    .catch(err =>
      console.error(
        'DB error:',
        err
      )
    );
}

function refreshLatestPositionsOverlay() {
  const overlay =
    document.getElementById(
      'latestPositionsOverlay'
    );

  if (!overlay) return;

  getAllPositions()
    .then(positions => {
      if (!positions.length) {
        overlay.textContent =
          'No recent positions.';

        return;
      }

      positions.sort(
        (a, b) =>
          b.timestamp -
          a.timestamp
      );

      const recent =
        positions.slice(
          0,
          APP_CONFIG
            .HISTORY_OVERLAY_COUNT
        );

      let txt =
        'Last positions:\n\n';

      recent.forEach(p => {
        txt +=
          `${new Date(
            p.timestamp
          ).toLocaleTimeString()} | ` +

          `${p.latitude.toFixed(5)}, ` +
          `${p.longitude.toFixed(5)}\n`;
      });

      overlay.textContent = txt;
    })
    .catch(() => {
      overlay.textContent =
        'Error loading positions.';
    });
}


// ================== Existing Geolocation ==================

function requestGeolocationAndUpdate() {
  if (!navigator.geolocation) {
    return;
  }

  const geolocTime =
    new Date();

  navigator.geolocation
    .getCurrentPosition(
      pos => {
        const lat =
          pos.coords.latitude;

        const lng =
          pos.coords.longitude;

        const geoText =
`****************************** GEOLOCATION ******************************

Timestamp: ${geolocTime.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Latitude: ${lat}
Longitude: ${lng}
`;

        localStorage.setItem(
          'geolocResult',
          geoText
        );

        updatePosition(
          lat,
          lng,
          Date.now()
        );
      },

      err => {
        const geoText =
`****************************** GEOLOCATION ******************************

Timestamp: ${geolocTime.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Error: ${err.message}
`;

        localStorage.setItem(
          'geolocResult',
          geoText
        );
      }
    );
}


// ================== Navigation info ==================

let navInfoText = '';

function buildNavInfo() {
  let navInfo =
    '**************** NAVIGATION ****************\n';

  if (lastOrientation) {
    navInfo +=
      `Compass Heading: ${
        Math.round(
          lastOrientation.alpha || 0
        )
      }°\n`;

    navInfo +=
      `Beta: ${
        Math.round(
          lastOrientation.beta || 0
        )
      }°\n`;

    navInfo +=
      `Gamma: ${
        Math.round(
          lastOrientation.gamma || 0
        )
      }°\n`;
  } else {
    navInfo +=
      'Compass: N/A\n';
  }

  if (
    lastMotion &&
    lastMotion.acceleration
  ) {
    const a =
      lastMotion.acceleration;

    navInfo +=
      `Acceleration: ` +
      `x=${
        a.x?.toFixed(2) ||
        'N/A'
      } ` +
      `y=${
        a.y?.toFixed(2) ||
        'N/A'
      } ` +
      `z=${
        a.z?.toFixed(2) ||
        'N/A'
      }\n`;
  } else {
    navInfo +=
      'Motion: N/A\n';
  }

  if (batteryStatus) {
    navInfo +=
      `Battery: ${
        Math.round(
          batteryStatus.level *
          100
        )
      }%\n`;
  } else {
    navInfo +=
      'Battery: N/A\n';
  }

  navInfoText = navInfo;

  localStorage.setItem(
    'navResult',
    navInfoText
  );
}

setInterval(
  buildNavInfo,
  1000
);


// ================== Existing History ==================

async function buildHistoryText() {
  const positions =
    await getAllPositions();

  if (!positions.length) {
    return (
      '*************** HISTORY ***************\n\n' +
      'No history available.\n'
    );
  }

  positions.sort(
    (a, b) =>
      b.timestamp -
      a.timestamp
  );

  let history =
    '*************** HISTORY ***************\n\n';

  positions.forEach(p => {
    history +=
`Timestamp: ${new Date(p.timestamp).toLocaleString()}
Latitude: ${p.latitude}
Longitude: ${p.longitude}

`;
  });

  return history;
}


// ================== iframe postMessage API ==================

function isAllowedTravelMessageOrigin(
  origin
) {
  return APP_CONFIG
    .TRAVEL_ALLOWED_MESSAGE_ORIGINS
    .includes(origin);
}

function sendTravelMessageResponse(
  event,
  payload
) {
  if (!event.source) return;

  event.source.postMessage(
    payload,
    event.origin
  );
}

async function handleTravelMessage(
  event
) {
  if (
    !isAllowedTravelMessageOrigin(
      event.origin
    )
  ) {
    return;
  }

  const data =
    event.data;

  if (
    !data ||
    data.type !==
      'travel-command'
  ) {
    return;
  }

  const {
    requestId = null,
    command,
    params = {}
  } = data;

  try {
    let result;

    switch (command) {
      case 'startTravel':
        result =
          await startTravel(
            params.name,
            params
          );
        break;

      case 'endTravel':
        result =
          await endTravel(
            params.name
          );
        break;

      case 'openTravel':
        result =
          await openTravel(
            params.name
          );
        break;

      case 'deleteTravel':
        result =
          await deleteTravel(
            params.name
          );
        break;

      case 'listTravels':
        result =
          await getAllTravels();
        break;

      case 'getTravel':
        result =
          await getTravel(
            params.name
          );
        break;

      case 'getTravelPoints':
        result =
          await getTravelPoints(
            params.name
          );
        break;

      case 'getTravelStatus':
        result =
          getTravelStatus();
        break;

      default:
        throw new Error(
          `Unknown travel command: ${command}`
        );
    }

    sendTravelMessageResponse(
      event,
      {
        type:
          'travel-response',

        requestId,
        command,
        ok: true,
        result
      }
    );
  } catch (err) {
    sendTravelMessageResponse(
      event,
      {
        type:
          'travel-response',

        requestId,
        command,
        ok: false,

        error:
          err?.message ||
          String(err)
      }
    );
  }
}

window.addEventListener(
  'message',
  handleTravelMessage
);


// ================== Public Callable Functions ==================
//
// All travel-callable functions are grouped here.
// Existing global functions remain untouched.
//

window.TravelAPI = {
  // Start and persist one travel.
  startTravel,

  // End the current travel.
  endTravel,

  // Resume persisted running travel.
  resumeCurrentTravel,

  // Return current recording state.
  getTravelStatus,

  // Return one stored travel.
  getTravel,

  // Return all stored travels.
  getAllTravels,

  // Return ordered points for a travel.
  getTravelPoints,

  // Draw one travel on the map.
  openTravel,

  // Remove travel and linked points.
  deleteTravel,

  // Remove displayed travel layers.
  clearDisplayedTravel
};


// ================== DOMContentLoaded ==================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    // Restore compass value.
    const storedCompass =
      localStorage.getItem(
        'compassValue'
      );

    const compassOverlay =
      document.getElementById(
        'compassOverlay'
      );

    if (
      storedCompass &&
      compassOverlay
    ) {
      compassOverlay.textContent =
        storedCompass;
    }


    // Wake lock.
    requestScreenWakeLock();

    document.addEventListener(
      'visibilitychange',
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          requestScreenWakeLock();
        } else {
          releaseScreenWakeLock();
        }
      }
    );


    // Rebuild existing history markers.
    getAllPositions()
      .then(records => {
        records.forEach(record => {
          const marker =
            L.circleMarker(
              [
                record.latitude,
                record.longitude
              ],
              {
                radius: 4,
                color: '#FF0000',
                fillOpacity: 0.8
              }
            ).addTo(map);

          historyMarkers.push(
            marker
          );
        });

        refreshLatestPositionsOverlay();
      })
      .catch(err =>
        console.error(
          'DB error:',
          err
        )
      );


    // Automatically restore an unfinished travel.
    resumeCurrentTravel()
      .then(travel => {
        if (travel) {
          console.log(
            'Travel resumed:',
            travel.name
          );
        }
      })
      .catch(err =>
        console.error(
          'Travel resume error:',
          err
        )
      );


    // Existing modal wiring.
    const modal =
      document.getElementById(
        'controlModal'
      );

    const burgerBtn =
      document.getElementById(
        'burger-btn'
      );

    const closeModal =
      document.getElementById(
        'closeModal'
      );

    const dataDisplay =
      document.getElementById(
        'dataDisplay'
      );

    burgerBtn.addEventListener(
      'click',
      () => {
        if (
          modal.style.display ===
          'block'
        ) {
          modal.style.display =
            'none';
        } else {
          modal.style.display =
            'block';
        }
      }
    );

    closeModal.addEventListener(
      'click',
      () => {
        modal.style.display =
          'none';
      }
    );

    window.addEventListener(
      'click',
      e => {
        if (e.target === modal) {
          modal.style.display =
            'none';
        }
      }
    );


    // Existing UI buttons.
    const geolocBtn =
      document.getElementById(
        'geolocBtn'
      );

    const ipBtn =
      document.getElementById(
        'ipBtn'
      );

    const compassBtn =
      document.getElementById(
        'compassBtn'
      );

    const stopCompassBtn =
      document.getElementById(
        'stopCompassBtn'
      );

    const openGMapsBtn =
      document.getElementById(
        'openGMapsBtn'
      );

    const offlineNavBtn =
      document.getElementById(
        'offlineNavBtn'
      );

    const clearBtn =
      document.getElementById(
        'clearBtn'
      );

    const showDataBtn =
      document.getElementById(
        'showDataBtn'
      );


    geolocBtn.addEventListener(
      'click',
      () => {
        requestGeolocationAndUpdate();
      }
    );


    ipBtn.addEventListener(
      'click',
      () => {
        const now =
          new Date();

        fetch('/api/ip')
          .then(r => r.json())
          .then(localData => {
            return fetch(
              'https://api.ipify.org?format=json'
            )
              .then(r => r.json())
              .then(publicData => {
                const text =
`**************** IP LOOKUP **********************

Timestamp: ${now.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Local IP: ${localData.ip}
Public IP: ${publicData.ip}
`;

                localStorage.setItem(
                  'ipResult',
                  text
                );
              });
          })
          .catch(err => {
            const text =
`**************** IP LOOKUP **********************

Timestamp: ${now.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Error: ${err.message}
`;

            localStorage.setItem(
              'ipResult',
              text
            );
          });
      }
    );


    compassBtn.addEventListener(
      'click',
      () => {
        startSensors();

        compassBtn.style.display =
          'none';

        stopCompassBtn.style.display =
          'block';
      }
    );


    stopCompassBtn.addEventListener(
      'click',
      () => {
        stopSensors();

        compassBtn.style.display =
          'block';

        stopCompassBtn.style.display =
          'none';
      }
    );


    // Existing Google Maps action.
    openGMapsBtn.addEventListener(
      'click',
      () => {
        if (!currentMarker) {
          alert(
            'No location available for navigation.'
          );

          return;
        }

        const {
          lat,
          lng
        } =
          currentMarker.getLatLng();

        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
          '_blank'
        );
      }
    );


    // Existing offline navigation toggle.
    offlineNavBtn.addEventListener(
      'click',
      () => {
        if (offlineNavActive) {
          stopOfflineNavigation();
        } else {
          startOfflineNavigation();
        }
      }
    );


    // Existing offline navigation restore.
    getSetting(
      'offlineNavActive'
    )
      .then(value => {
        if (value === true) {
          startOfflineNavigation();
        } else {
          updateOfflineNavUI(false);
        }
      })
      .catch(() => {
        updateOfflineNavUI(false);
      });


    // Existing Clear All.
    clearBtn.addEventListener(
      'click',
      () => {
        const ok =
          window.confirm(
            'This will clear all history, local storage and markers. Are you sure?'
          );

        if (!ok) return;

        clearPositions()
          .then(() => {
            historyMarkers.forEach(
              m => m.remove()
            );

            historyMarkers = [];

            currentMarker &&
              currentMarker.remove();

            currentMarker = null;

            localStorage.clear();

            refreshLatestPositionsOverlay();

            dataDisplay.textContent =
              '';
          })
          .catch(err =>
            console.error(
              'Clear error:',
              err
            )
          );
      }
    );


    // Existing Show Data.
    let dataVisible = false;

    showDataBtn.addEventListener(
      'click',
      async () => {
        if (dataVisible) {
          dataDisplay.textContent =
            '';

          dataVisible = false;
          return;
        }

        const geoloc =
          localStorage.getItem(
            'geolocResult'
          ) || '';

        const nav =
          localStorage.getItem(
            'navResult'
          ) ||
          navInfoText ||
          '';

        const ip =
          localStorage.getItem(
            'ipResult'
          ) || '';

        const history =
          await buildHistoryText();

        dataDisplay.textContent =
          `${geoloc}\n\n` +
          `${ip}\n\n` +
          `${nav}\n\n` +
          `${history}`;

        dataVisible = true;
      }
    );
  }
);
