(function() {
    var css = `
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        overflow: hidden;
        background-color: #121212;
        color: #fff;
      }
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 220px;
        bottom: 0;
        background: #1e1e1e;
        padding: 10px;
        box-sizing: border-box;
        color: #fff;
      }
      .sidebar .logo {
        display: block;
        margin: 0 auto 10px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
      }
      .sidebar h2 {
        font-size: 20px;
        margin: 0 0 10px;
        text-align: center;
      }
      .sidebar button {
        display: block;
        width: 100%;
        margin-bottom: 10px;
        padding: 10px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        background: #ef6300;
        color: #fff;
        cursor: pointer;
        border-radius: 4px;
      }
      .sidebar button:hover {
        background: #d75c00;
      }
      .main {
        margin-left: 240px;
        padding: 10px;
        height: 100vh;
        overflow-y: auto;
        box-sizing: border-box;
        display: grid;
        grid-gap: 10px;
      }
      /* Dynamic grid layouts */
      .grid-1 {
        grid-template-columns: 1fr;
      }
      .grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }
      .grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .grid-4 {
        grid-template-columns: repeat(4, 1fr);
      }
      /* Force one column on mobile */
      @media (max-width: 768px) {
        .main {
          grid-template-columns: 1fr !important;
          margin-left: 0;
        }
        .sidebar {
          width: 100%;
          position: relative;
        }
      }
      .screen {
        display: flex;
        flex-direction: column;
        background: #2c2c2c;
        border: 1px solid #444;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 4px;
        min-height: 300px;
      }
      .screen select {
        width: 100%;
        padding: 8px;
        margin-bottom: 8px;
        font-size: 16px;
        background: #006a7f;
        color: #fff;
        border: none;
        border-radius: 4px;
      }
      .screen iframe {
        flex-grow: 1;
        width: 100%;
        border: none;
      }
    `;
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  })();
  