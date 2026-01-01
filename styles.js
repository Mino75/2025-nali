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
      background-color: #111;
      color: #eee;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Fullscreen map */
    #map {
      width: 100%;
      height: 100vh;
    }

    /* Burger button */
    #burger-btn {
      position: fixed;
      top: 10px;
      left: 10px;
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
      background-color: rgba(180, 0, 0, 0.85); /* default OFF = red-ish */
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
      pointer-events: none; /* don't block map interactions */
    }

    /* Modal base */
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

    /* Buttons (global) */
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
    }

    button:hover {
      background-color: #333;
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    /* Buttons inside modal */
    .modal-content button {
      width: 100%;
      display: block;
    }

    .close {
      float: right;
      font-size: 28px;
      cursor: pointer;
    }

    /* Data text area in modal */
    #dataDisplay {
      margin-top: 15px;
      font-family: monospace;
      white-space: pre-wrap;
      font-size: 13px;
    }

    /* Country labels (names on map) */
    .country-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      font-weight: 200;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.9);
      pointer-events: none;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      #map {
        height: 100vh;
      }
      #latestPositionsOverlay {
        max-width: 80%;
      }
    }
  `;
  document.head.appendChild(style);
})();
