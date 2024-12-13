// src/js/firebaseConfig.js

// Importiere die Firebase-Funktionen über vollständige URLs
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js';

// Deine Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyA5uiT78hEvuelCb4ldNCSwxSMytkL4h1M",
  authDomain: "ice-cold-beer-highscore.firebaseapp.com",
  projectId: "ice-cold-beer-highscore",
  storageBucket: "ice-cold-beer-highscore.firebasestorage.app",
  messagingSenderId: "246699784456",
  appId: "1:246699784456:web:5d84bbd3ed66d85e32d4bd",
  measurementId: "G-2LJLBGWGHE"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore initialisieren

export { db };
