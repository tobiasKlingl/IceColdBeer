// src/js/gameLogic.js

/**
 * gameLogic.js
 * Enthält die Spiellogik, einschließlich Bewegung, Kollision und Spielstatus.
 */

import { gameState, resetGame } from './gameState.js';
import { config } from './config.js';
import { updateDisplay } from './ui.js';

/**
 * Interval-IDs für die Bewegung der Stangen.
 * Diese Variablen speichern die Intervalle für die Bewegung der linken und rechten Stange.
 */
let leftInterval = null;
let rightInterval = null;

/**
 * Funktion zum Zurücksetzen der Spiel-Logik.
 * Stoppt alle laufenden Intervalle und setzt das Spiel zurück.
 */
export function resetGameLogic() {
    // Stoppe alle laufenden Intervalle
    if (leftInterval) {
        clearInterval(leftInterval);
        leftInterval = null;
    }
    if (rightInterval) {
        clearInterval(rightInterval);
        rightInterval = null;
    }

    // Setze den Spielzustand zurück
    resetGame();
}

/**
 * Funktion zum Starten der Bewegung einer Stange.
 * @param {string} barSide - 'left' oder 'right' zur Auswahl der Stange.
 * @param {number} direction - -1 für aufwärts, 1 für abwärts.
 */
export function startMoving(barSide, direction) {
    const barSpeed = config.baseBarSpeed;
    if (barSide === 'left') {
        if (leftInterval) clearInterval(leftInterval);
        leftInterval = setInterval(function() {
            gameState.bar.leftY += direction * barSpeed;
            // Begrenze die Bewegung innerhalb des Canvas
            gameState.bar.leftY = Math.max(0, Math.min(gameState.canvas.height, gameState.bar.leftY));
        }, 16); // Aktualisierung ca. 60 Mal pro Sekunde
    } else if (barSide === 'right') {
        if (rightInterval) clearInterval(rightInterval);
        rightInterval = setInterval(function() {
            gameState.bar.rightY += direction * barSpeed;
            gameState.bar.rightY = Math.max(0, Math.min(gameState.canvas.height, gameState.bar.rightY));
        }, 16);
    }
}

/**
 * Funktion zum Stoppen der Bewegung einer Stange.
 * @param {string} barSide - 'left' oder 'right' zur Auswahl der Stange.
 */
export function stopMoving(barSide) {
    if (barSide === 'left' && leftInterval) {
        clearInterval(leftInterval);
        leftInterval = null;
    } else if (barSide === 'right' && rightInterval) {
        clearInterval(rightInterval);
        rightInterval = null;
    }
}
