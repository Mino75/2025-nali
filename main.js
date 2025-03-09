// main.js

// Register the Service Worker for offline functionality
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(registration => console.log('ServiceWorker registered:', registration))
    .catch(error => console.log('ServiceWorker registration failed:', error));
}

// Global sensor variables for navigation info
let lastOrientation = null;
let lastMotion = null;
let batteryStatus = null;

// Request battery info (if supported)
if (navigator.getBattery) {
  navigator.getBattery().then(battery => {
    batteryStatus = battery;
  });
}

// Handle device orientation events
function handleOrientation(event) {
  lastOrientation = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  };
  if (compassOverlay) {
    const heading = Math.round(event.alpha);
    compassOverlay.style.transform = `rotate(${-heading}deg)`;
    compassOverlay.textContent = `${heading}°`;
    // Persist the compass value
    localStorage.setItem('compassValue', `${heading}°`);
  }
}

// Handle device motion events
function handleMotion(event) {
  lastMotion = {
    acceleration: event.acceleration,
    rotationRate: event.rotationRate,
    interval: event.interval
  };
}

// Start sensor listeners
function startSensors() {
  window.addEventListener('deviceorientation', handleOrientation);
  window.addEventListener('devicemotion', handleMotion);
}

// Stop sensor listeners
function stopSensors() {
  window.removeEventListener('deviceorientation', handleOrientation);
  window.removeEventListener('devicemotion', handleMotion);
}

// Create a compass overlay on the top right if it doesn't exist
let compassOverlay = document.getElementById('compassOverlay');
if (!compassOverlay) {
  compassOverlay = document.createElement('div');
  compassOverlay.id = 'compassOverlay';
  // Style: 80x80 circular overlay
  compassOverlay.style.position = 'fixed';
  compassOverlay.style.top = '10px';
  compassOverlay.style.right = '10px';
  compassOverlay.style.width = '80px';
  compassOverlay.style.height = '80px';
  compassOverlay.style.backgroundColor = 'rgba(255,255,255,0.8)';
  compassOverlay.style.borderRadius = '50%';
  compassOverlay.style.display = 'flex';
  compassOverlay.style.alignItems = 'center';
  compassOverlay.style.justifyContent = 'center';
  compassOverlay.style.fontSize = '20px';
  compassOverlay.style.zIndex = '9999';
  // Restore persisted compass value if available
  const storedCompass = localStorage.getItem('compassValue');
  compassOverlay.textContent = storedCompass ? storedCompass : '--°';
  document.body.appendChild(compassOverlay);
}

// Update navigation info every 1 second and persist it
setInterval(() => {
  let navInfo = "**************** NAVIGATION ****************\n";
  if (lastOrientation) {
    navInfo += `Compass Heading: ${Math.round(lastOrientation.alpha)}°\n`;
    navInfo += `Beta: ${Math.round(lastOrientation.beta)}°\n`;
    navInfo += `Gamma: ${Math.round(lastOrientation.gamma)}°\n`;
  } else {
    navInfo += "Compass: N/A\n";
  }
  if (lastMotion && lastMotion.acceleration) {
    navInfo += `Acceleration: x=${lastMotion.acceleration.x?.toFixed(2) || "N/A"}\n`;
    navInfo += `             y=${lastMotion.acceleration.y?.toFixed(2) || "N/A"}\n`;
    navInfo += `             z=${lastMotion.acceleration.z?.toFixed(2) || "N/A"}\n`;
    if (lastMotion.rotationRate) {
      navInfo += `Rotation Rate: alpha=${lastMotion.rotationRate.alpha?.toFixed(2) || "N/A"}\n`;
      navInfo += `               beta=${lastMotion.rotationRate.beta?.toFixed(2) || "N/A"}\n`;
      navInfo += `               gamma=${lastMotion.rotationRate.gamma?.toFixed(2) || "N/A"}\n`;
    }
  } else {
    navInfo += "Motion: N/A\n";
  }
  if (batteryStatus) {
    navInfo += `Battery: ${Math.round(batteryStatus.level * 100)}%\n`;
  } else {
    navInfo += "Battery: N/A\n";
  }
  const navResultDiv = document.getElementById('navResult');
  if (navResultDiv) {
    navResultDiv.textContent = navInfo;
    localStorage.setItem('navResult', navInfo);
  }
}, 1000);

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Restore persisted values if available
  const persistedGeoloc = localStorage.getItem('geolocResult');
  if (persistedGeoloc) {
    document.getElementById('geolocResult').innerHTML = persistedGeoloc;
  }
  const persistedIp = localStorage.getItem('ipResult');
  if (persistedIp) {
    document.getElementById('ipResult').innerHTML = persistedIp;
  }
  const persistedNav = localStorage.getItem('navResult');
  if (persistedNav) {
    document.getElementById('navResult').textContent = persistedNav;
  }

  // Sidebar toggle for mobile
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('sidebar');
  burgerBtn.addEventListener('click', () => sidebar.classList.toggle('active'));

  // Elements for controls
  const geolocBtn = document.getElementById('geolocBtn');
  const ipBtn = document.getElementById('ipBtn');
  const compassBtn = document.getElementById('compassBtn');
  const stopCompassBtn = document.getElementById('stopCompassBtn');
  const startNavBtn = document.getElementById('startNavBtn');
  const clearBtn = document.getElementById('clearBtn');
  const geolocResultDiv = document.getElementById('geolocResult');
  const ipResultDiv = document.getElementById('ipResult');
  const historyListDiv = document.getElementById('historyList');

  // Utility: Get full user agent string
  function getDeviceInfo() {
    return navigator.userAgent;
  }

  // Initialize the Leaflet map centered globally
  const map = L.map('map').setView([20, 0], 2);

  // Function to load GeoJSON layers
  function loadGeoJSON(url, styleOptions, popupField) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        L.geoJSON(data, {
          style: styleOptions,
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties[popupField]) {
              layer.bindPopup(`<strong>${feature.properties[popupField]}</strong>`);
            }
          }
        }).addTo(map);
      })
      .catch(error => console.error(`Error loading ${url}:`, error));
  }

  // Load offline layers (land and countries)
  loadGeoJSON('land.geojson', {
    color: "#999",
    weight: 1,
    fillColor: "#ccc",
    fillOpacity: 0.5
  }, 'name');
  loadGeoJSON('countries.geojson', {
    color: "#3388ff",
    weight: 1,
    fillOpacity: 0.2
  }, 'name');

  // Markers for current and historical positions
  let currentMarker;
  let historyMarkers = [];

  // Update current position marker ("HERE") and add a small historical marker.
  // Also update persistent displays.
  function updatePosition(lat, lng, timestamp) {
    map.setView([lat, lng], 13);
    if (currentMarker) { currentMarker.remove(); }
    currentMarker = L.marker([lat, lng]).addTo(map)
      .bindPopup(`<strong>HERE</strong><br>Latitude: ${lat}<br>Longitude: ${lng}<br>Timestamp: ${timestampStr}`).openPopup();
    // Add a small history marker
    historyMarker.timestamp = timestamp;
    historyMarker.latitude = lat;
    historyMarker.longitude = lng;
    // Add a click event so that when clicked, it shows its coordinates and timestamp
    historyMarker.on('click', function(e) {
      L.popup()
        .setLatLng(e.latlng)
        .setContent(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>Timestamp: ${timestampStr}`)
        .openOn(map);
    });
    historyMarker.addTo(map);
    historyMarkers.push(historyMarker);
    // Save position to IndexedDB
    const positionRecord = { latitude: lat, longitude: lng, timestamp: timestamp };
    addPosition(positionRecord)
      .then(() => updateDisplays())
      .catch(err => console.error('DB Error:', err));
  }

// Update the "History" display (placed at the bottom, below navigation)
function updateDisplays() {
  getAllPositions().then(positions => {
    if (positions && positions.length > 0) {
      // Sort positions by timestamp (newest first)
      positions.sort((a, b) => b.timestamp - a.timestamp);
      // Take only the 20 most recent positions
      const recentPositions = positions.slice(0, 20);
      let historyHTML = "*************** HISTORY ***************<br><br>";
      recentPositions.forEach(pos => {
        historyHTML += `Timestamp: ${new Date(pos.timestamp).toLocaleString()}<br>` +
                       `Latitude: ${pos.latitude}<br>` +
                       `Longitude: ${pos.longitude}<br><br>`;
      });
      historyListDiv.innerHTML = historyHTML;
    } else {
      historyListDiv.innerHTML = "No history available.<br>";
    }
  });
}

  // Restore historical positions on load and update displays
  getAllPositions().then(records => {
    records.forEach(record => {
      L.circleMarker([record.latitude, record.longitude], {
        radius: 4,
        color: '#FF0000',
        fillOpacity: 0.8
      }).addTo(map);
    });
    updateDisplays();
  }).catch(err => console.error('DB Error:', err));

  // Geolocation button handler with section header and line breaks
  geolocBtn.addEventListener('click', () => {
    geolocResultDiv.innerHTML = "****************************** GEOLOCATION ******************************<br><br>";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const currentTime = new Date().toLocaleString();
        const { latitude, longitude } = position.coords;
        geolocResultDiv.innerHTML += `Timestamp: ${currentTime}<br>`;
        geolocResultDiv.innerHTML += `Device / User Agent: ${getDeviceInfo()}<br>`;
        geolocResultDiv.innerHTML += `Latitude: ${latitude}<br>`;
        geolocResultDiv.innerHTML += `Longitude: ${longitude}<br><br>`;
        localStorage.setItem('geolocResult', geolocResultDiv.innerHTML);
        updatePosition(latitude, longitude, Date.now());
      }, error => {
        geolocResultDiv.innerHTML += `Error: ${error.message}<br>`;
        localStorage.setItem('geolocResult', geolocResultDiv.innerHTML);
      });
    } else {
      geolocResultDiv.innerHTML += 'Geolocation is not supported.<br>';
      localStorage.setItem('geolocResult', geolocResultDiv.innerHTML);
    }
  });

  // IP lookup button handler with section header and line breaks
 // IP lookup button handler with section header and line breaks
ipBtn.addEventListener('click', () => {
  ipResultDiv.innerHTML = "**************** IP LOOKUP **********************<br><br>";
  
  // First, call your local API endpoint
  fetch('/api/ip')
    .then(response => response.json())
    .then(data => {
      const currentTime = new Date().toLocaleString();
      ipResultDiv.innerHTML += `Timestamp: ${currentTime}<br>`;
      ipResultDiv.innerHTML += `Device / User Agent: ${getDeviceInfo()}<br>`;
      ipResultDiv.innerHTML += `Local IP: ${data.ip}<br><br>`;
      localStorage.setItem('ipResult', ipResultDiv.innerHTML);
      // Then, call ipify to get the public IP
      return fetch('https://api.ipify.org?format=json');
    })
    .then(response => response.json())
    .then(data => {
      ipResultDiv.innerHTML += `IPify Public IP: ${data.ip}<br><br>`;
      localStorage.setItem('ipResult', ipResultDiv.innerHTML);
    })
    .catch(error => {
      ipResultDiv.innerHTML += `Error: ${error.message}<br>`;
      localStorage.setItem('ipResult', ipResultDiv.innerHTML);
    });
});


  // Compass controls: start and stop sensors
  compassBtn.addEventListener('click', () => {
    startSensors();
    compassBtn.style.display = 'none';
    stopCompassBtn.style.display = 'block';
  });
  stopCompassBtn.addEventListener('click', () => {
    stopSensors();
    compassBtn.style.display = 'block';
    stopCompassBtn.style.display = 'none';
    if (compassOverlay) {
      compassOverlay.textContent = '--°';
      compassOverlay.style.transform = 'rotate(0deg)';
      localStorage.setItem('compassValue', '--°');
    }
  });

  // Start Online Navigation button handler
  startNavBtn.addEventListener('click', () => {
    if (currentMarker) {
      const latLng = currentMarker.getLatLng();
      const lat = latLng.lat;
      const lng = latLng.lng;
      const ua = navigator.userAgent.toLowerCase();
      // Android: use geo URI scheme
      if (ua.indexOf("android") > -1) {
        window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(Destination)`;
      }
      // iOS: use Apple Maps URL scheme
      else if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1) {
        window.location.href = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
      }
      // Fallback: open Google Maps in a new tab
      else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
      }
    } else {
      alert("No location available for navigation.");
    }
  });

  // Clear button: clear outputs, markers, and IndexedDB; also clear persisted data
  clearBtn.addEventListener('click', () => {
    geolocResultDiv.textContent = '';
    ipResultDiv.textContent = '';
    document.getElementById('navResult').textContent = '';
    historyListDiv.textContent = '';
    if (currentMarker) currentMarker.remove();
    historyMarkers.forEach(marker => marker.remove());
    historyMarkers = [];
    clearPositions().then(() => updateDisplays());
    localStorage.removeItem('geolocResult');
    localStorage.removeItem('ipResult');
    localStorage.removeItem('navResult');
    localStorage.removeItem('compassValue');
  });
});
