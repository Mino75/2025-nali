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
      flex-direction: row;
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
    /* Sidebar styles */
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
      position: relative;
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
    /* Burger button: visible on mobile, hidden on desktop */
    #burger-btn {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      color: #fff;
      cursor: pointer;
      margin-bottom: 15px;
    }
    /* Content area (map and results) */
    #content {
      flex: 1;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* Adjusted heights: smaller map, larger results */
    #map {
      height: 45%;
      border-radius: 8px;
      margin: 10px;
    }
    #results {
      padding: 10px;
      background: #1E1E1E;
      color: #E0E0E0;
      margin: 10px;
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
        flex-direction: column;
      }
      #sidebar {
        width: 100%;
        height: auto;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      #sidebar.active {
        transform: translateY(0);
      }
      #burger-btn {
        display: block;
      }
      #content {
        height: calc(100vh - 50px);
      }
      #map {
        height: 35%;
      }
      #results {
        height: 60%;
      }
    }
  `;
  document.head.appendChild(style);
})();
