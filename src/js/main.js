// src/js/main.js

/**
 * main.js
 * Der Haupt-Einstiegspunkt des Spiels.
 * Importiert und initialisiert alle notwendigen Module.
 */

import { initializeGame } from './game.js';

window.onload = function() {
    // Konfiguration laden
    const script = document.createElement('script'); // Erstellt dynamisch ein leeres <script>-Tag (document ist ein globales Objekt, das die gesamte HTML-Seite darstellt.)
    script.src = 'src/js/config.js'; // Quelle der externen JavaScript-Datei
    script.onload = function() {  // onload-Eigenschaft des <script>-Tags: Diese Funktion wird aufgerufen, sobald src/js/config.js vollständig geladen und ausgeführt wurde.
        initializeGame();
    };
    document.head.appendChild(script); // Das <script>-Tag wird in den <head>-Bereich des Dokument eingefügt
};
