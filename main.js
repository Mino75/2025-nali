// ================== IndexedDB ==================
const DB_NAME='PositionDB';
const DB_VERSION=1;
const STORE='positions';
let db;

function openDB(){
  return new Promise((resolve,reject)=>{
    if(db) return resolve(db);
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onerror=e=>reject(e.target.error);
    req.onsuccess=e=>{db=e.target.result;resolve(db);}
    req.onupgradeneeded=e=>{
      db=e.target.result;
      if(!db.objectStoreNames.contains(STORE))
        db.createObjectStore(STORE,{keyPath:'timestamp'});
    }
  });
}

function addPosition(p){
  return openDB().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).add(p).onsuccess=res;
    tx.onerror=e=>rej(e.target.error);
  }));
}

function getAllPositions(){
  return openDB().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction(STORE,'readonly');
    const req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>res(req.result);
    req.onerror=e=>rej(e.target.error);
  }));
}

function clearPositions(){
  return openDB().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).clear().onsuccess=res;
    tx.onerror=e=>rej(e.target.error);
  }));
}

// ================== Sensors & Globals ==================
let lastOrientation=null;
let lastMotion=null;
let batteryStatus=null;

if(navigator.getBattery){
  navigator.getBattery().then(b=>batteryStatus=b);
}

function handleOrientation(e){
  lastOrientation={alpha:e.alpha,beta:e.beta,gamma:e.gamma};
  const heading=Math.round(e.alpha||0);
  const overlay=document.getElementById("compassOverlay");
  if(overlay){
    overlay.style.transform=`rotate(${-heading}deg)`;
    overlay.textContent=`${heading}°`;
  }
  localStorage.setItem("compassValue",`${heading}°`);
}

function handleMotion(e){
  lastMotion={
    acceleration:e.acceleration,
    rotationRate:e.rotationRate,
    interval:e.interval
  };
}

function startSensors(){
  window.addEventListener("deviceorientation",handleOrientation);
  window.addEventListener("devicemotion",handleMotion);
}

function stopSensors(){
  window.removeEventListener("deviceorientation",handleOrientation);
  window.removeEventListener("devicemotion",handleMotion);
  localStorage.setItem("compassValue","--°");
  const overlay=document.getElementById("compassOverlay");
  if(overlay){
    overlay.textContent="--°";
    overlay.style.transform="rotate(0deg)";
  }
}

// ================== MAP ==================
const map=L.map('map').setView([20,0],2);

fetch('countries.geojson')
.then(r=>r.json())
.then(data=>{
  L.geoJSON(data,{color:"#3388ff",weight:1,fillOpacity:0.2}).addTo(map);
});

let currentMarker;
let historyMarkers=[];

function updatePosition(lat,lng,timestamp){
  map.setView([lat,lng],13);
  if(currentMarker) currentMarker.remove();
  currentMarker=L.marker([lat,lng]).addTo(map)
    .bindPopup(`<strong>HERE</strong><br>${lat},${lng}`).openPopup();

  const m=L.circleMarker([lat,lng],{radius:4,color:"#ff0000",fillOpacity:.8});
  m.addTo(map);
  historyMarkers.push(m);

  addPosition({latitude:lat,longitude:lng,timestamp})
    .catch(e=>console.error(e));
}

// ================== UI ==================
document.addEventListener("DOMContentLoaded",()=>{

  // Restore compass
  const cv=localStorage.getItem("compassValue");
  if(cv) document.getElementById("compassOverlay").textContent=cv;

  const modal=document.getElementById("controlModal");
  const burger=document.getElementById("burger-btn");
  const closeModal=document.getElementById("closeModal");
  const dataDisplay=document.getElementById("dataDisplay");

  burger.onclick=()=>modal.style.display="block";
  closeModal.onclick=()=>modal.style.display="none";
  window.onclick=e=>{if(e.target===modal)modal.style.display="none"};

  // Buttons
  document.getElementById("geolocBtn").onclick=()=>{
    if(!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos=>{
      const t=Date.now();
      const lat=pos.coords.latitude;
      const lng=pos.coords.longitude;

      let txt=
`****************************** GEOLOCATION ******************************

Timestamp: ${new Date(t).toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Latitude: ${lat}
Longitude: ${lng}
`;
      localStorage.setItem("geolocResult",txt);
      updatePosition(lat,lng,t);
    });
  };

  document.getElementById("ipBtn").onclick=()=>{
    fetch('/api/ip')
    .then(r=>r.json())
    .then(d=>{
      return fetch('https://api.ipify.org?format=json')
      .then(r=>r.json())
      .then(pub=>{
        let txt=
`**************** IP LOOKUP **********************

Timestamp: ${new Date().toLocaleString()}
Device / User Agent: ${navigator.userAgent}
Local IP: ${d.ip}
Public IP: ${pub.ip}
`;
        localStorage.setItem("ipResult",txt);
      });
    });
  };

  document.getElementById("compassBtn").onclick=()=>{
    startSensors();
    document.getElementById("compassBtn").style.display="none";
    document.getElementById("stopCompassBtn").style.display="block";
  };

  document.getElementById("stopCompassBtn").onclick=()=>{
    stopSensors();
    document.getElementById("compassBtn").style.display="block";
    document.getElementById("stopCompassBtn").style.display="none";
  };

  document.getElementById("startNavBtn").onclick=()=>{
    if(!currentMarker) return alert("No location");
    const {lat,lng}=currentMarker.getLatLng();
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,'_blank');
  };

  document.getElementById("clearBtn").onclick=()=>{
    clearPositions();
    historyMarkers.forEach(m=>m.remove());
    historyMarkers=[];
    localStorage.clear();
    dataDisplay.textContent="";
  };

  document.getElementById("showDataBtn").onclick=async()=>{

    const nav=buildNavInfo();
    const history=await buildHistory();

    dataDisplay.textContent =
(localStorage.getItem("geolocResult")||"")+
"\n"+
(nav||"")+
"\n"+
history;
  };

  function buildNavInfo(){
    let s="**************** NAVIGATION ****************\n";
    if(lastOrientation)
      s+=`Compass Heading: ${Math.round(lastOrientation.alpha)}°\n`;
    else s+="Compass: N/A\n";

    if(lastMotion && lastMotion.acceleration)
      s+=`Motion detected\n`;
    else s+="Motion: N/A\n";

    if(batteryStatus)
      s+=`Battery: ${Math.round(batteryStatus.level*100)}%\n`;
    else s+="Battery: N/A\n";

    return s;
  }

  async function buildHistory(){
    const rows=await getAllPositions();
    if(!rows.length) return "No history\n";
    rows.sort((a,b)=>b.timestamp-a.timestamp);
    let out="*************** HISTORY ***************\n\n";
    rows.slice(0,20).forEach(r=>{
      out+=
`Timestamp: ${new Date(r.timestamp).toLocaleString()}
Latitude: ${r.latitude}
Longitude: ${r.longitude}

`;
    });
    return out;
  }

});
