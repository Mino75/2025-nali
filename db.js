// db.js: IndexedDB functions for position records

const DB_NAME = 'PositionDB';
const DB_VERSION = 1;
const STORE_NAME = 'positions';

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
    } else {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = event => reject(event.target.error);
      request.onsuccess = event => {
        db = event.target.result;
        resolve(db);
      };
      request.onupgradeneeded = event => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
        }
      };
    }
  });
}

function addPosition(position) {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(position);
      req.onsuccess = () => resolve();
      req.onerror = event => reject(event.target.error);
    });
  });
}

function getAllPositions() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = event => reject(event.target.error);
    });
  });
}

function getLatestPosition() {
  return getAllPositions().then(positions => {
    if (!positions || positions.length === 0) return null;
    positions.sort((a, b) => b.timestamp - a.timestamp);
    return positions[0];
  });
}

function clearPositions() {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = event => reject(event.target.error);
    });
  });
}
