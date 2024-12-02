// src/js/physics.js

/**
 * physics.js
 * Enthält die Physik-Logik des Spiels, einschließlich Schwerkraft, Reibung und Kollisionserkennung.
 */

import { ball, bar, canvas, gameOver, holes, currentTarget, lives } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGame } from './gameLogic.js';

/**
 * Funktion zur Anwendung der Physik auf den Ball.
 * Wird in jedem Frame aufgerufen.
 */
export function applyPhysics() {
    if (!gameOver) {
        // Schwerkraft anwenden
        ball.speedY += config.gravity;

        // Kugelposition basierend auf Geschwindigkeit aktualisieren
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Kugel auf der Stange halten, wenn sie nahe genug ist
        const barSlope = (bar.rightY - bar.leftY) / canvas.width; // Steigung der Stange
        const barYAtBallX = bar.leftY + barSlope * ball.x; // Y-Position der Stange bei der aktuellen X-Position des Balls

        // Prüfen, ob der Ball die Stange berührt
        if (ball.y + ball.radius > barYAtBallX - bar.height / 2 &&
            ball.y + ball.radius < barYAtBallX + bar.height &&
            ball.x > 0 && ball.x < canvas.width) {
            ball.y = barYAtBallX - ball.radius - bar.height / 2; // Kugel auf die Stange setzen
            ball.speedY = 0; // Vertikale Geschwindigkeit stoppen

            // Neigung der Stange berücksichtigen
            let sinTheta = barSlope / Math.sqrt(1 + barSlope * barSlope);
            ball.speedX += config.gravity * sinTheta;
            ball.speedX *= config.friction; // Reibung anwenden
        }

        // Kugel an den Rändern des Canvas stoppen
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.speedX = 0;
        }
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.speedX = 0;
        }

        // Überprüfen, ob die Kugel in ein Loch fällt
        holes.forEach(hole => {
            const dx = ball.x - hole.actualX;
            const dy = ball.y - hole.actualY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance + ball.radius <= hole.actualRadius * config.holeOverlapThreshold) {
                // Kugel fällt in ein Loch
                gameOver = true;
                const holeTypeNum = hole.Type;
                if (holeTypeNum === currentTarget.toString()) {
                    alert('Gut gemacht! Du hast Loch ' + currentTarget + ' erreicht.');
                    currentTarget++;
                    if (currentTarget > config.totalLevels) {
                        // Spiel gewonnen
                        showEndScreen(true);
                        return;
                    }
                } else if (holeTypeNum === 'M') {
                    // Verlustloch
                    lives--;
                    if (lives <= 0) {
                        // Spiel verloren
                        showEndScreen(false);
                        return;
                    } else {
                        alert('Falsches Loch! Du hast noch ' + lives + ' Leben.');
                    }
                }
                // Spiel zurücksetzen
                resetGame();
            }
        });

        // Überprüfen, ob die Kugel unten aus dem Bildschirm fällt
        if (ball.y - ball.radius > canvas.height) {
            gameOver = true;
            lives--;
            if (lives <= 0) {
                // Spiel verloren
                showEndScreen(false);
                return;
            } else {
                alert('Verloren! Du hast noch ' + lives + ' Leben.');
                resetGame();
            }
        }
    }
}
