// ================== CONFIG ==================
const APP_CONFIG = {
  GEOLOCATION_INTERVAL_MS: 5 * 60 * 1000,
  HISTORY_OVERLAY_COUNT: 5,

  LABEL_LAYERS: {
    continents: { enabled: true, minZoom: 2, maxZoom: 3 },
    seas: { enabled: true, minZoom: 3, maxZoom: 6 },
    countries: { enabled: true, minZoom: 4, maxZoom: 6 },
    mountains: { enabled: true, minZoom: 4, maxZoom: 7 },
    capitals: { enabled: true, minZoom: 5, maxZoom: 10 }
  }
};


// ================== IndexedDB Layer ==================
const DB_NAME = 'PositionDB';
const DB_VERSION = 2;              // upgrade, but keep existing store
const STORE_POSITIONS = 'positions';
const STORE_SETTINGS = 'settings'; // new store for meta (offline nav etc.)

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => reject(event.target.error);

    request.onsuccess = event => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = event => {
      db = event.target.result;

      // Preserve existing positions store
      if (!db.objectStoreNames.contains(STORE_POSITIONS)) {
        db.createObjectStore(STORE_POSITIONS, { keyPath: 'timestamp' });
      }

      // Add settings store (for offline nav status, etc.)
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

// Positions API
function addPosition(position) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_POSITIONS, 'readwrite');
      const store = tx.objectStore(STORE_POSITIONS);
      const req = store.add(position);
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

// Settings API (key/value)
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
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = ev => reject(ev.target.error);
    });
  });
}

// ================== Sensors & Wake Lock ==================
let lastOrientation = null;
let lastMotion = null;
let batteryStatus = null;

// Battery
if (navigator.getBattery) {
  navigator.getBattery().then(b => { batteryStatus = b; });
}

// Wake Lock (best-effort)
let wakeLock = null;

async function requestScreenWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener?.('release', () => {
        // could log or notify
      });
    }
  } catch (e) {
    // Not supported or denied; non-fatal
  }
}

async function releaseScreenWakeLock() {
  try {
    await wakeLock?.release();
  } catch (e) {
    // ignore
  }
  wakeLock = null;
}

// Orientation
function handleOrientation(event) {
  lastOrientation = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  };

  const compassOverlay = document.getElementById('compassOverlay');
  const heading = Math.round(event.alpha || 0);

  if (compassOverlay) {
    compassOverlay.style.transform = `rotate(${-heading}deg)`;
    compassOverlay.textContent = `${heading}°`;
  }
  localStorage.setItem('compassValue', `${heading}°`);
}

// Motion
function handleMotion(event) {
  lastMotion = {
    acceleration: event.acceleration,
    rotationRate: event.rotationRate,
    interval: event.interval
  };
}

function startSensors() {
  window.addEventListener('deviceorientation', handleOrientation);
  window.addEventListener('devicemotion', handleMotion);
}

function stopSensors() {
  window.removeEventListener('deviceorientation', handleOrientation);
  window.removeEventListener('devicemotion', handleMotion);
  const compassOverlay = document.getElementById('compassOverlay');
  localStorage.setItem('compassValue', '--°');
  if (compassOverlay) {
    compassOverlay.textContent = '--°';
    compassOverlay.style.transform = 'rotate(0deg)';
  }
}

// ================== Map & Layers ==================
const map = L.map('map').setView([20, 0], 2);

// Load countries GeoJSON + labels
fetch('countries.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#3388ff',
        weight: 1,
        fillOpacity: 0.2
      },
      onEachFeature: (feature, layer) => {
        // Popup standard
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
        }
        // Label at center (transparent / thin font)
        try {
          const center = layer.getBounds().getCenter();
          if (APP_CONFIG.SHOW_COUNTRY_LABELS && feature.properties && feature.properties.name) {
            L.marker(center, {
              icon: L.divIcon({
                className: 'country-label',
                html: feature.properties.name
              })
            }).addTo(map);
          }
        } catch (e) {
          // ignore if bounds not valid
        }
      }
    }).addTo(map);
  })
  .catch(err => console.error('Error loading countries.geojson:', err));

// Markers & overlays
let currentMarker = null;
let historyMarkers = [];

// ================== Offline Navigation State ==================
let offlineNavInterval = null;
let offlineNavActive = false;

// Navigation status overlay + button sync
function updateOfflineNavUI(active) {
  offlineNavActive = active;
  const statusDiv = document.getElementById('offlineNavStatus');
  const btn = document.getElementById('offlineNavBtn');

  if (statusDiv) {
    statusDiv.textContent = active ? 'Navigation ON' : 'Navigation OFF';
    statusDiv.style.backgroundColor = active
      ? 'rgba(0, 160, 0, 0.85)'
      : 'rgba(180, 0, 0, 0.85)';
  }

  if (btn) {
    btn.textContent = active ? 'Offline Navigation: ON' : 'Offline Navigation: OFF';
    btn.style.backgroundColor = active ? '#146314' : '#222';
  }
}

// Start offline nav (5 min polling)
function startOfflineNavigation() {
  if (offlineNavInterval) clearInterval(offlineNavInterval);
  updateOfflineNavUI(true);
  setSetting('offlineNavActive', true).catch(() => {});

  // Immediate geoloc
  requestGeolocationAndUpdate();

  // Poll every 5 minutes
  offlineNavInterval = setInterval(() => {
    requestGeolocationAndUpdate();
  }, APP_CONFIG.GEOLOCATION_INTERVAL_MS);
}

function stopOfflineNavigation() {
  if (offlineNavInterval) {
    clearInterval(offlineNavInterval);
    offlineNavInterval = null;
  }
  updateOfflineNavUI(false);
  setSetting('offlineNavActive', false).catch(() => {});
}

// ================== Position update & overlays ==================
function updatePosition(lat, lng, timestamp) {
  map.setView([lat, lng], 13);

  if (currentMarker) currentMarker.remove();

  const tsStr = new Date(timestamp).toLocaleString();

  currentMarker = L.marker([lat, lng]).addTo(map)
    .bindPopup(`<strong>HERE</strong><br>Latitude: ${lat}<br>Longitude: ${lng}<br>Timestamp: ${tsStr}`)
    .openPopup();

  const historyMarker = L.circleMarker([lat, lng], {
    radius: 4,
    color: '#FF0000',
    fillOpacity: 0.8
  }).addTo(map);

  historyMarkers.push(historyMarker);

  const record = { latitude: lat, longitude: lng, timestamp };
  addPosition(record)
    .then(() => refreshLatestPositionsOverlay())
    .catch(err => console.error('DB error:', err));
}

// Refresh bottom-right overlay with last 5 positions
function refreshLatestPositionsOverlay() {
  const overlay = document.getElementById('latestPositionsOverlay');
  if (!overlay) return;

  getAllPositions()
    .then(positions => {
      if (!positions.length) {
        overlay.textContent = 'No recent positions.';
        return;
      }
      positions.sort((a, b) => b.timestamp - a.timestamp);
      const recent = positions.slice(0, 5);
      let txt = 'Last positions:\n\n';
      recent.forEach(p => {
        txt += `${new Date(p.timestamp).toLocaleTimeString()} | ${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}\n`;
      });
      overlay.textContent = txt;
    })
    .catch(() => {
      overlay.textContent = 'Error loading positions.';
    });
}

// ================== Geolocation core logic ==================
function requestGeolocationAndUpdate() {
  if (!navigator.geolocation) return;

  const geolocTime = new Date();

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const geoText =
`****************************** GEOLOCATION ******************************

Timestamp: ${geolocTime.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Latitude: ${lat}
Longitude: ${lng}
`;

      localStorage.setItem('geolocResult', geoText);

      // Update map + DB
      updatePosition(lat, lng, Date.now());
    },
    err => {
      const geoText =
`****************************** GEOLOCATION ******************************

Timestamp: ${geolocTime.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Error: ${err.message}
`;
      localStorage.setItem('geolocResult', geoText);
    }
  );
}

// ================== Navigation info (text) ==================
let navInfoText = '';

function buildNavInfo() {
  let navInfo = '**************** NAVIGATION ****************\n';

  if (lastOrientation) {
    navInfo += `Compass Heading: ${Math.round(lastOrientation.alpha || 0)}°\n`;
    navInfo += `Beta: ${Math.round(lastOrientation.beta || 0)}°\n`;
    navInfo += `Gamma: ${Math.round(lastOrientation.gamma || 0)}°\n`;
  } else {
    navInfo += 'Compass: N/A\n';
  }

  if (lastMotion && lastMotion.acceleration) {
    const a = lastMotion.acceleration;
    navInfo += `Acceleration: x=${a.x?.toFixed(2) || 'N/A'} y=${a.y?.toFixed(2) || 'N/A'} z=${a.z?.toFixed(2) || 'N/A'}\n`;
  } else {
    navInfo += 'Motion: N/A\n';
  }

  if (batteryStatus) {
    navInfo += `Battery: ${Math.round(batteryStatus.level * 100)}%\n`;
  } else {
    navInfo += 'Battery: N/A\n';
  }

  navInfoText = navInfo;
  localStorage.setItem('navResult', navInfoText);
}

// Periodic navigation text update
setInterval(buildNavInfo, 1000);

// ================== History (full, for modal) ==================
async function buildHistoryText() {
  const positions = await getAllPositions();
  if (!positions.length) return '*************** HISTORY ***************\n\nNo history available.\n';

  positions.sort((a, b) => b.timestamp - a.timestamp);
  let history = '*************** HISTORY ***************\n\n';
  positions.forEach(p => {
    history +=
`Timestamp: ${new Date(p.timestamp).toLocaleString()}
Latitude: ${p.latitude}
Longitude: ${p.longitude}

`;
  });
  return history;
}

// ================== DOMContentLoaded ==================
document.addEventListener('DOMContentLoaded', () => {
  // Restore compass value
  const storedCompass = localStorage.getItem('compassValue');
  const compassOverlay = document.getElementById('compassOverlay');
  if (storedCompass && compassOverlay) {
    compassOverlay.textContent = storedCompass;
  }

  // Wake lock
  requestScreenWakeLock();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }
  });

  // Rebuild history markers from DB
  getAllPositions()
    .then(records => {
      records.forEach(record => {
        const marker = L.circleMarker([record.latitude, record.longitude], {
          radius: 4,
          color: '#FF0000',
          fillOpacity: 0.8
        }).addTo(map);
        historyMarkers.push(marker);
      });
      refreshLatestPositionsOverlay();
    })
    .catch(err => console.error('DB error:', err));

  // Modal wiring
  const modal = document.getElementById('controlModal');
  const burgerBtn = document.getElementById('burger-btn');
  const closeModal = document.getElementById('closeModal');
  const dataDisplay = document.getElementById('dataDisplay');

  burgerBtn.addEventListener('click', () => {
    if (modal.style.display === 'block') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'block';
    }
  });


  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // UI buttons
  const geolocBtn = document.getElementById('geolocBtn');
  const ipBtn = document.getElementById('ipBtn');
  const compassBtn = document.getElementById('compassBtn');
  const stopCompassBtn = document.getElementById('stopCompassBtn');
  const openGMapsBtn = document.getElementById('openGMapsBtn');
  const offlineNavBtn = document.getElementById('offlineNavBtn');
  const clearBtn = document.getElementById('clearBtn');
  const showDataBtn = document.getElementById('showDataBtn');

  geolocBtn.addEventListener('click', () => {
    requestGeolocationAndUpdate();
  });

  ipBtn.addEventListener('click', () => {
    const now = new Date();
    fetch('/api/ip')
      .then(r => r.json())
      .then(localData => {
        return fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(publicData => {
            const text =
`**************** IP LOOKUP **********************

Timestamp: ${now.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Local IP: ${localData.ip}
Public IP: ${publicData.ip}
`;
            localStorage.setItem('ipResult', text);
          });
      })
      .catch(err => {
        const text =
`**************** IP LOOKUP **********************

Timestamp: ${now.toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Error: ${err.message}
`;
        localStorage.setItem('ipResult', text);
      });
  });

  compassBtn.addEventListener('click', () => {
    startSensors();
    compassBtn.style.display = 'none';
    stopCompassBtn.style.display = 'block';
  });

  stopCompassBtn.addEventListener('click', () => {
    stopSensors();
    compassBtn.style.display = 'block';
    stopCompassBtn.style.display = 'none';
  });

  // Open Google Maps
  openGMapsBtn.addEventListener('click', () => {
    if (!currentMarker) {
      alert('No location available for navigation.');
      return;
    }
    const { lat, lng } = currentMarker.getLatLng();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  });

  // Offline navigation toggle
  offlineNavBtn.addEventListener('click', () => {
    if (offlineNavActive) {
      stopOfflineNavigation();
    } else {
      startOfflineNavigation();
    }
  });

  // Restore offline nav state from DB (resume navigation if ON)
  getSetting('offlineNavActive')
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

  // Clear All with confirmation
  clearBtn.addEventListener('click', () => {
    const ok = window.confirm('This will clear all history, local storage and markers. Are you sure?');
    if (!ok) return;

    clearPositions()
      .then(() => {
        historyMarkers.forEach(m => m.remove());
        historyMarkers = [];
        currentMarker && currentMarker.remove();
        currentMarker = null;
        localStorage.clear();
        refreshLatestPositionsOverlay();
        dataDisplay.textContent = '';
      })
      .catch(err => console.error('Clear error:', err));
  });

  // Show Data & History in modal
let dataVisible = false;

showDataBtn.addEventListener('click', async () => {
  if (dataVisible) {
    dataDisplay.textContent = '';
    dataVisible = false;
    return;
  }

  const geoloc = localStorage.getItem('geolocResult') || '';
  const nav = localStorage.getItem('navResult') || navInfoText || '';
  const ip = localStorage.getItem('ipResult') || '';
  const history = await buildHistoryText();

  dataDisplay.textContent = `${geoloc}\n\n${ip}\n\n${nav}\n\n${history}`;
    dataVisible = true;
});
});

