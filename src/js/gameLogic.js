// src/js/gameLogic.js

/**
 * gameLogic.js
 * Enthält die Spiellogik, einschließlich Bewegung, Kollision und Spielstatus.
 */

import { canvas, lives, currentTarget, bar, gameOver, holes, showEndScreen, resetGame } from './gameState.js';
import { config } from './config.js';
import { updateDisplay } from './ui.js';

/**
 * Interval-IDs für die Bewegung der Stangen.
 */
let leftInterval = null;
let rightInterval = null;

/**
 * Funktion zum Zurücksetzen des Spiels.
 * Setzt die Position des Balls und der Stangen zurück, stoppt Bewegung und startet den Timer neu.
 */
export function resetGame() {
    // Ball-Position und -Geschwindigkeit zurücksetzen
    ball.x = canvas.width - config.ballStartOffsetX; // Startposition der Kugel vom rechten Rand
    ball.y = canvas.height - config.ballStartOffsetY; // Startposition der Kugel vom unteren Rand
    ball.speedX = 0;
    ball.speedY = 0;
    ball.radius = config.ballRadius;
    ball.color = config.ballColor;

    // Stangenposition und -eigenschaften zurücksetzen
    bar.leftY = canvas.height - config.barStartOffsetY; // Startposition der linken Stange
    bar.rightY = canvas.height - config.barStartOffsetY; // Startposition der rechten Stange
    bar.height = config.barHeight;
    bar.color = config.barColor;

    // Spielzustand zurücksetzen
    gameOver = false;

    // Bewegung der Stangen stoppen
    if (leftInterval) {
        clearInterval(leftInterval);
        leftInterval = null;
    }
    if (rightInterval) {
        clearInterval(rightInterval);
        rightInterval = null;
    }

    // Löcher neu berechnen basierend auf der aktuellen Canvas-Größe
    holes.forEach(hole => {
        hole.actualX = hole.x * canvas.width;
        hole.actualY = hole.y * canvas.height;
        hole.actualRadius = hole.radius * canvas.width * 1.0; // Skalierung basierend auf der Canvas-Breite
    });

    // Timer starten, falls es das erste Level ist und volle Leben vorhanden sind
    if (currentTarget === 1 && lives === config.maxLives) {
        startTime = Date.now();
        elapsedTime = 0;
        clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            updateDisplay();
        }, 1000);
    }

    // Anzeige aktualisieren
    updateDisplay();
}

/**
 * Funktion zum Starten der Bewegung einer Stange.
 * @param {string} barSide - 'left' oder 'right'
 * @param {number} direction - -1 für aufwärts, 1 für abwärts
 */
export function startMoving(barSide, direction) {
    const barSpeed = config.baseBarSpeed;
    if (barSide === 'left') {
        if (leftInterval) clearInterval(leftInterval);
        leftInterval = setInterval(function() {
            bar.leftY += direction * barSpeed;
            bar.leftY = Math.max(0, Math.min(canvas.height, bar.leftY));
        }, 16); // Etwa 60 Frames pro Sekunde
    } else if (barSide === 'right') {
        if (rightInterval) clearInterval(rightInterval);
        rightInterval = setInterval(function() {
            bar.rightY += direction * barSpeed;
            bar.rightY = Math.max(0, Math.min(canvas.height, bar.rightY));
        }, 16);
    }
}

/**
 * Funktion zum Stoppen der Bewegung einer Stange.
 * @param {string} barSide - 'left' oder 'right'
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
