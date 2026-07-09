# 🌍 Nali - Geolocation Web Application

**Nali** (那里) - from Chinese meaning "where" or "there" - is a Progressive Web Application (PWA) for real-time geolocation tracking with offline capabilities, built with Leaflet.js and featuring global geographic data visualization.

## 📍 About the Name

The app is named **Nali** (那里), which means "where" or "there" in Chinese, capturing the essence of this location-tracking application. Just as the word helps answer the question "where?", this app helps you discover and track where you are in the world.

## ✨ Features

- 📍 **Real-time Geolocation**: Track your current position using browser's Geolocation API
- 🗺️ **Interactive Map**: Powered by Leaflet.js with country boundaries visualization
- 📱 **Progressive Web App**: Full offline support with service worker caching
- 🔄 **Auto-refresh**: Continuous location updates with configurable intervals
- 📊 **Location History**: Track and visualize your movement history
- 🌐 **IP-based Location**: Fallback location detection via IP address
- 💾 **Local Storage**: Persistent data storage using IndexedDB
- 🚀 **Fast & Responsive**: Optimized performance with lazy loading

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Leaflet.js v1.9.4
- **Backend**: Node.js with Express.js
- **Database**: IndexedDB for client-side storage
- **PWA**: Service Worker with cache-first strategy
- **Container**: Docker support included

## 📦 Installation

### Prerequisites

- Node.js (v18.18.0 or higher)
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/nali.git
cd nali

# Install dependencies
npm install

# Start the development server
npm start

# Visit http://localhost:3000
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t nali .

# Run the container
docker run -p 3000:3000 nali
```

## 🗺️ Geographic Data

This application uses geographic data from **Natural Earth**, which is in the **public domain**.

### Data Sources

- **countries.geojson**: Country boundaries data from [Natural Earth](https://www.naturalearthdata.com/)
  - 📄 License: **Public Domain**
  - 🔍 Scale: 1:10m Cultural Vectors
  - 📊 Contains: Country polygons with properties (name, ISO codes, etc.)

Natural Earth is a public domain map dataset available at 1:10m, 1:50m, and 1:110m scales. All data is free to use for any purpose without restriction.

## 🏗️ Project Structure

```
├── 📁 /
│   ├── 📄 index.html          # Main HTML file
│   ├── 📄 main.js             # Core application logic
│   ├── 📄 server.js           # Express server
│   ├── 📄 service-worker.js   # PWA service worker
│   ├── 📄 db.js               # IndexedDB management
│   ├── 📄 styles.js           # Dynamic styling
│   ├── 📄 api.js              # API endpoints
│   ├── 🗺️ countries.geojson   # Country boundaries (Public Domain)
│   ├── 🗺️ land.geojson        # Land masses data
│   ├── 📄 manifest.json       # PWA manifest
│   ├── 📄 Dockerfile          # Docker configuration
│   └── 📄 package.json        # Node dependencies
```

## 🚀 Features in Detail

### 🔐 Service Worker Strategy

- **Cache-first** approach for offline functionality
- Automatic cache versioning (v2)
- Background sync for updates
- Intelligent timeout handling for first-time vs returning users

### 📍 Geolocation Features

- HTML5 Geolocation API with high accuracy
- Continuous tracking with configurable intervals
- Visual markers for current position ("HERE")
- Historical position tracking with timestamps

### 🗺️ Map Visualization

- Interactive Leaflet map with pan and zoom
- Country boundaries with clickable popups
- Custom markers for location history
- Responsive design for mobile and desktop

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Cache Configuration
CACHE_VERSION=v2
APP_NAME=nali

# Service Worker Settings
SW_FIRST_TIME_TIMEOUT=20000
SW_RETURNING_USER_TIMEOUT=5000
SW_ENABLE_LOGS=true
```

## 📱 PWA Support

The application is Progressive Web App with:

- ✅ Offline capability
- ✅ Install prompt
- ✅ App icons (192x192, 512x512)
- ✅ Responsive design
- ✅ Fast loading times

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 📋 License Details & Requirements

#### Leaflet.js (BSD 2-Clause "Simplified" License)
The BSD 2-Clause License is very permissive, similar to MIT. You can:
- ✅ Use commercially without fees
- ✅ Modify the source code
- ✅ Distribute in your products
- ✅ Use in proprietary software

**Only requirement**: Include the original copyright notice and disclaimer in your distributions.

```
Copyright (c) 2010-2024, Volodymyr Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.
```

#### Natural Earth Data (Public Domain)
- 🌍 **No restrictions whatsoever**
- Free for any use (commercial, personal, educational)
- No attribution required (though appreciated)
- Can modify and redistribute freely

### Third-Party Licenses

- **Leaflet.js**: [BSD 2-Clause License](https://github.com/Leaflet/Leaflet/blob/main/LICENSE)
  - ✅ Free for commercial use
  - ✅ Can modify and distribute
  - ✅ Must include copyright notice
  - ✅ No warranty liability
- **Natural Earth Data**: Public Domain (no restrictions)
- **Express.js**: MIT License

## 🙏 Acknowledgments

- 🌍 [Natural Earth](https://www.naturalearthdata.com/) for providing public domain geographic data
- 🗺️ [Leaflet.js](https://leafletjs.com/) for the amazing mapping library
- 👥 All contributors and users of this application

---

🌏 **那里 Nali** - Where in the world are you? 📍

Made using open-source technologies and public domain data
