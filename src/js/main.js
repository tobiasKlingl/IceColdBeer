// src/js/main.js

/**
 * main.js
 * Der Haupt-Einstiegspunkt des Spiels.
 * Importiert und initialisiert alle notwendigen Module.
 */

import { initializeGame } from './gameState.js';
import { setCSSVariables } from './utils.js';

// Sobald das Fenster vollständig geladen ist, initialisiere das Spiel
window.onload = function() {
    setCSSVariables(); // CSS-Variablen setzen
    initializeGame();
};
