// styles.js
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Reset and global layout */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
    }
    body {
      background-color: #121212;
      color: #E0E0E0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 18px;
      display: flex;
      flex-direction: row; /* Desktop: row layout */
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    button {
      background-color: #1F1F1F;
      border: none;
      border-radius: 8px;
      color: #E0E0E0;
      cursor: pointer;
      font-size: 1.2rem;
      margin: 10px;
      padding: 15px 25px;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }
    button:hover {
      background-color: #333333;
      transform: translateY(-2px);
    }
    button:active {
      transform: translateY(0);
    }

    /* Burger button: hidden on desktop, visible on mobile */
    #burger-btn {
      display: none;
      background: rgba(0, 0, 0, 0.7);
      border: none;
      font-size: 24px;
      color: #fff;
      cursor: pointer;
      padding: 10px;
      border-radius: 4px;
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 10000;
    }

    /* Sidebar for desktop */
    #sidebar {
      background: #333;
      color: #fff;
      width: 250px;
      min-width: 250px;
      height: 100vh;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      transition: all 0.3s ease;
    }
    #sidebar h2 {
      margin-bottom: 1em;
    }
    #sidebar button {
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
    }
    /* Logo style: circular cropped image */
    #logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 15px;
      align-self: center;
    }

    /* Content area (map and results) for desktop */
    #content {
      margin-left: 250px; /* Leaves space for the sidebar on the left */
      flex: 1;
      height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-top 0.3s ease;
    }
    /* Map container spanning full width of content */
    #map {
      width: 100%;
      height: 45%;
      border-radius: 8px;
      margin: 10px 0;
    }
    /* Results container spanning full width */
    #results {
      width: 100%;
      padding: 10px;
      background: #1E1E1E;
      color: #E0E0E0;
      margin: 10px 0;
      border-radius: 8px;
      height: 50%;
      overflow-y: auto;
    }
    /* Compass display in sidebar */
    #compassDisplay {
      margin-top: 10px;
      background: #222;
      padding: 10px;
      text-align: center;
    }

    /* Responsive adjustments for mobile */
    @media (max-width: 768px) {
      body {
        flex-direction: column; /* Stacks sidebar and content vertically */
      }
      #burger-btn {
        display: block; /* Visible on mobile */
      }
      /* Sidebar is hidden by default on mobile, becomes static in normal flow */
      #sidebar {
        position: static;
        width: 100%;
        height: auto;
        display: none; /* hidden by default */
        order: 1;
      }
      #sidebar.active {
        display: flex; /* shown when toggled */
      }
      /* Content takes full width and appears after sidebar */
      #content {
        margin-left: 0; /* no left margin on mobile */
        width: 100%;
        order: 2;
        height: auto;
      }
      #map {
        width: 100%;
        height: 35%;
        margin: 10px 0;
      }
      #results {
        width: 100%;
        height: 60%;
        margin: 10px 0;
      }
    }
  `;
  document.head.appendChild(style);
})();
