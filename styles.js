// styles.js
(function () {
  const style = document.createElement('style');
  style.innerHTML = `
*{box-sizing:border-box;margin:0;padding:0}

html,body{
  width:100%;
  height:100%;
  background:#0c0f18;
  color:#eee;
  font-family:Segoe UI,Arial;
}

.leaflet-container{
  background:#0c0f18!important;
}

/* FULL MAP */
#map{
  width:100%;
  height:100vh;
}

/* 🔥 BURGER FIX — ONLY BUTTON IS CLICKABLE */
#burger-btn{
  position:fixed;
  top:10px;
  left:50%;
  transform:translateX(-50%);
  z-index:11000;
  font-size:24px;
  padding:10px 14px;
  border:none;
  border-radius:6px;
  background:rgba(0,0,0,0.8);
  color:#fff;
  cursor:pointer;
  width:auto;
  display:inline-block;
  pointer-events:auto;
}

/* Compass */
#compassOverlay{
  position:fixed;
  top:10px;
  right:10px;
  width:80px;
  height:80px;
  background:#fff8;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#000;
  z-index:11000;
}

/* Offline status */
#offlineNavStatus{
  position:fixed;
  top:100px;
  left:10px;
  padding:6px 10px;
  border-radius:6px;
  z-index:11000;
}

/* Latest positions overlay */
#latestPositionsOverlay{
  position:fixed;
  right:10px;
  bottom:10px;
  max-width:260px;
  background:#0009;
  padding:10px;
  border-radius:8px;
  font-family:monospace;
  font-size:12px;
  z-index:11000;
  pointer-events:none;
}

/* Modal */
.modal{
  display:none;
  position:fixed;
  left:0;top:0;
  width:100%;height:100%;
  background:#000d;
  z-index:10000;
  backdrop-filter:blur(6px);
}
.modal-content{
  width:90%;
  max-width:600px;
  margin:5% auto;
  padding:20px;
  background:#181818;
  border-radius:12px;
  color:#fff;
  max-height:90%;
  overflow-y:auto;
}
.close{float:right;font-size:28px;cursor:pointer}

button{
  width:100%;
  padding:14px;
  margin:8px 0;
  border:none;
  border-radius:8px;
  background:#222;
  color:#fff;
  font-size:16px;
}

.continent-label,
.country-label,
.capital-label,
.mountain-label,
.sea-label{
  background:transparent;
  border:none;
  box-shadow:none;
  white-space:nowrap;
  pointer-events:none;
  text-shadow:0 0 4px #000, 0 0 8px #000;
}

.continent-label{
  color:#ffffff;
  opacity:.95;
  font-weight:700;
  font-size:18px;
}

.country-label{
  color:#dce7ff;
  opacity:.85;
  font-weight:300;
  font-size:18px;
}

.capital-label{
  color:#ffe7a3;
  opacity:.95;
  font-weight:600;
  font-size:12px;
}

.mountain-label{
  color:#d6d6d6;
  opacity:.9;
  font-style:italic;
  font-weight:500;
  font-size:12px;
}

.sea-label{
  color:#7fd4ff;
  opacity:.9;
  font-style:italic;
  font-weight:400;
  font-size:13px;
}
`;
  document.head.appendChild(style);
})();
