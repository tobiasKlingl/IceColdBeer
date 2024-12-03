// src/js/ui.js

/**
 * ui.js
 * Verwalten der Benutzeroberfläche (Anzeige von Leben, Zielen und Timer).
 */

import { gameState } from './gameState.js';

/**
 * Funktion zur Initialisierung der Benutzeroberfläche.
 * Aktualisiert die Anzeige beim Spielstart.
 */
export function initializeUI() {
    // Initiale Anzeige aktualisieren
    updateDisplay();
}

/**
 * Funktion zur Aktualisierung der Benutzeroberfläche.
 * Zeigt die aktuellen Leben, das aktuelle Ziel und die verstrichene Zeit an.
 */
export function updateDisplay() {
    const livesDisplay = document.getElementById('lives');
    const currentHoleDisplay = document.getElementById('currentHole');
    const timerDisplay = document.getElementById('timer');

    // Leben als Herz-Emojis anzeigen
    let hearts = '';
    for (let i = 0; i < gameState.lives; i++) {
        hearts += '❤️';
    }
    livesDisplay.textContent = 'Leben: ' + hearts;

    // Aktuelles Ziel anzeigen
    currentHoleDisplay.textContent = 'Aktuelles Ziel: Loch ' + gameState.currentTarget;

    // Timer aktualisieren
    const minutes = Math.floor(gameState.elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (gameState.elapsedTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = 'Zeit: ' + minutes + ':' + seconds;
}