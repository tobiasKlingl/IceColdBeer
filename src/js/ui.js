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
    const currentModeDisplay = document.getElementById('currentMode'); // Neue Variable

    // Leben als Herz-Emojis anzeigen
    let hearts = '';
    for (let i = 0; i < gameState.lives; i++) {
        hearts += '❤️';
    }
    livesDisplay.textContent = 'Leben: ' + hearts;

    // Aktuelles Modus anzeigen mit Emoji
    let modeEmoji = '';
    if (gameState.mode === 'expert') {
        modeEmoji = '💀'; // Totenkopf für Experte
    } else {
        modeEmoji = '😀'; // Lächelndes Gesicht für Normal
    }
    currentModeDisplay.textContent = `Modus: ${modeEmoji}`; // Nur "Modus: " und Emoji

    // Aktuelles Ziel anzeigen
    currentHoleDisplay.textContent = 'Ziel: Loch ' + gameState.currentTarget;

    // Timer aktualisieren
    const minutes = Math.floor(gameState.elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (gameState.elapsedTime % 60).toString().padStart(2, '0');
    timerDisplay.textContent = 'Zeit: ' + minutes + ':' + seconds;
}

/**
 * Funktion zum Anzeigen einer temporären Nachricht auf dem Bildschirm.
 * @param {string} message - Die anzuzeigende Nachricht.
 * @param {number} duration - Anzeigedauer in Millisekunden.
 * @param {function} callback - Funktion, die nach Ablauf ausgeführt wird.
 */
export function showTemporaryMessage(message, duration, callback) {
    const messageOverlay = document.createElement('div');
    messageOverlay.className = 'message-overlay';
    messageOverlay.textContent = message;
    document.body.appendChild(messageOverlay);

    setTimeout(() => {
        if (document.body.contains(messageOverlay)) {
            document.body.removeChild(messageOverlay);
        }
        if (callback) callback();
    }, duration);
}
