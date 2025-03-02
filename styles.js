(function() {
    var css = `
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        overflow: hidden;
        background-color: #121212;
        color: #fff;
      }

      /* Sidebar (Desktop Default) */
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
        z-index: 1000;
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

      /* Main Content Area (Desktop) */
      .main {
        margin-left: 240px;
        padding: 10px;
        height: 100vh;
        overflow-y: auto;
        box-sizing: border-box;
        display: grid;
        grid-gap: 10px;
      }

      /* Desktop Grid Layouts */
      .grid-1 { display: grid; grid-template-columns: 1fr; grid-auto-rows: 100vh; }
      .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: 100vh; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 100vh; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 100vh; }
      .grid-20 {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* 4 screens per row */
        grid-auto-rows: 250px; /* Fixed height for 20-screen mode */
        height: 100vh;
        overflow-y: auto;
        align-content: start;
      }

      /* Screen Styling (applies to desktop) */
      .screen {
        display: flex;
        flex-direction: column;
        background: #2c2c2c;
        border: 1px solid #444;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 4px;
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

      /* MOBILE-SPECIFIC STYLES (applies only when screen width <=768px) */
      @media only screen and (max-width: 768px) {
        /* Convert Sidebar to a Top Floating Menu */
        .sidebar {
          width: 100%;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          position: fixed;
          top: 0;
          left: 0;
          bottom: unset;
          padding: 5px;
          z-index: 1000;
        }

        /* Adjust Main Content to start below the floating menu */
        .main {
          margin-left: 0;
          margin-top: 70px;
          display: block;
          overflow-y: auto;
          height: calc(100vh - 70px);
        }

        /* Force All Screens into a Single Column with Fixed Height */
        .screen {
          width: 100%;
          height: 150px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Ensure any grid layouts are overridden on mobile */
        .grid-1, .grid-2, .grid-3, .grid-4, .grid-20 {
          display: block !important;
        }
      }
    `;

    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
})();
