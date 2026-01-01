// styles.js
(function () {
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      background-color: #0c0f18; /* very dark blue sea background */
      color: #eee;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Force Leaflet background to dark sea */
    .leaflet-container {
      background: #0c0f18 !important;
    }

    /* Fullscreen map */
    #map {
      width: 100%;
      height: 100vh;
    }

    /* 🔵 BURGER BUTTON CENTERED */
    #burger-btn {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 11000;
      font-size: 24px;
      padding: 10px 14px;
      border: none;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Compass overlay */
    #compassOverlay {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 80px;
      height: 80px;
      background-color: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #000;
      z-index: 11000;
    }

    /* Offline navigation status overlay */
    #offlineNavStatus {
      position: fixed;
      top: 100px;
      left: 10px;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background-color: rgba(180, 0, 0, 0.85);
      z-index: 11000;
    }

    /* Latest positions overlay */
    #latestPositionsOverlay {
      position: fixed;
      right: 10px;
      bottom: 10px;
      max-width: 260px;
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      font-size: 12px;
      line-height: 1.4;
      z-index: 11000;
      font-family: monospace;
      pointer-events: none;
    }

    /* Modal */
    .modal {
      display: none;
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      backdrop-filter: blur(6px);
    }

    .modal-content {
      width: 90%;
      max-width: 600px;
      margin: 5% auto;
      padding: 20px;
      background: #181818;
      color: #fff;
      border-radius: 12px;
      max-height: 90%;
      overflow-y: auto;
    }

    .modal-content h2 {
      margin-bottom: 10px;
    }

    button {
      padding: 14px;
      margin: 8px 0;
      border: none;
      border-radius: 8px;
      background-color: #222;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      display: inline-block;
      width: 100%;
    }

    button:hover {
      background-color: #333;
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    .close {
      float: right;
      font-size: 28px;
      cursor: pointer;
    }

    #dataDisplay {
      margin-top: 15px;
      font-family: monospace;
      white-space: pre-wrap;
      font-size: 13px;
    }

    /* 🏷️ COUNTRY LABELS WHITE + THIN */
    .country-label {
      color: rgba(255, 255, 255, 0.85);
      font-size: 12px;
      font-weight: 200;
      text-shadow: 0 0 4px rgba(0, 0, 0, 1);
      pointer-events: none;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      #latestPositionsOverlay {
        max-width: 80%;
      }
    }
  `;
  document.head.appendChild(style);
})();
