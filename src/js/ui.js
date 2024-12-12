// src/js/ui.js
import { gameState } from './gameState.js';
import { config } from './config.js';

let overlayTimeoutId = null;

/**
 * Initialisiert die UI-Anzeigen.
 */
export function initializeUI() {
    updateDisplay();
}

/**
 * Aktualisiert die Anzeigen wie Leben, Zeit, aktuelles Loch.
 */
export function updateDisplay() {
    const livesDisplay = gameState.livesDisplayElement;
    const currentHoleDisplay = gameState.currentHoleElement;
    const timerDisplay = gameState.timerDisplayElement;
    const currentModeDisplay = gameState.currentModeElement;

    let hearts = '';
    for (let i = 0; i < gameState.lives; i++) {
        hearts += '❤️';
    }
    livesDisplay.textContent = 'Leben: ' + hearts;

    const modeConfig = config.modes.gameModes[gameState.mode];
    if (modeConfig) {
        currentModeDisplay.textContent = `Modus: ${modeConfig.emoji}`;
    } else {
        console.error(`Unbekannter Modus: ${gameState.mode}`);
        currentModeDisplay.textContent = 'Modus: ❓';
    }

    currentHoleDisplay.textContent = 'Ziel: Loch ' + gameState.currentTarget;

    let elapsedTimeInSeconds = Math.floor(gameState.elapsedTime / 1000);
    const minutes = Math.floor(elapsedTimeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (elapsedTimeInSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = 'Zeit: ' + minutes + ':' + seconds;
}

/**
 * Zeigt vorübergehend eine Nachricht über dem Spielfeld an.
 * @param {string} message - Anzuzeigende Nachricht
 * @param {number} duration - Dauer in ms
 * @param {Function} callback - Optionale Callback-Funktion nach Ablauf
 */
export function showTemporaryMessage(message, duration, callback) {
    const messageOverlay = gameState.messageOverlayElement;
    if (messageOverlay) {
        gameState.overlayCancelled = false;
        messageOverlay.textContent = message;
        messageOverlay.style.display = 'block';

        if (overlayTimeoutId !== null) {
            clearTimeout(overlayTimeoutId);
        }

        overlayTimeoutId = setTimeout(() => {
            messageOverlay.style.display = 'none';
            overlayTimeoutId = null;
            if (callback && !gameState.overlayCancelled) {
                callback();
            }
        }, duration);
    } else {
        console.warn('Message overlay element not found.');
        if (callback && !gameState.overlayCancelled) callback();
    }
}

/**
 * Versteckt das Overlay.
 */
export function hideOverlay() {
    const messageOverlay = gameState.messageOverlayElement;

    if (messageOverlay) {
        messageOverlay.style.display = 'none';
    }

    if (overlayTimeoutId !== null) {
        clearTimeout(overlayTimeoutId);
        overlayTimeoutId = null;
    }
}
