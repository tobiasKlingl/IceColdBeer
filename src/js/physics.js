// src/js/physics.js

/**
 * physics.js
 * Enthält die Physik-Logik des Spiels, einschließlich Schwerkraft, Reibung und Kollisionserkennung.
 */

import { gameState } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGameLogic } from './gameLogic.js';

/**
 * Funktion zur Anwendung der Physik auf den Ball.
 * Wird in jedem Frame aufgerufen.
 */
export function applyPhysics() {
    if (gameState.gameOver) {
        return; // Beende die Physik-Updates, wenn das Spiel vorbei ist
    }
    
    // Schwerkraft anwenden
    gameState.ball.speedY += config.gravity;

    // Kugelposition basierend auf Geschwindigkeit aktualisieren
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Kugel auf der Stange halten, wenn sie nahe genug ist
    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / gameState.canvas.width; // Steigung der Stange
    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x; // Y-Position der Stange bei der aktuellen X-Position des Balls

    // Prüfen, ob der Ball die Stange berührt
    if (gameState.ball.y + gameState.ball.radius > barYAtBallX - gameState.bar.height / 2 &&
        gameState.ball.y + gameState.ball.radius < barYAtBallX + gameState.bar.height &&
        gameState.ball.x > 0 && gameState.ball.x < gameState.canvas.width) {
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / 2; // Kugel auf die Stange setzen
        gameState.ball.speedY = 0; // Vertikale Geschwindigkeit stoppen

        // Neigung der Stange berücksichtigen
        let sinTheta = barSlope / Math.sqrt(1 + barSlope * barSlope);
        gameState.ball.speedX += config.gravity * sinTheta;
        gameState.ball.speedX *= config.friction; // Reibung anwenden
    }

    // Kugel an den Rändern des Canvas stoppen
    if (gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.x = gameState.ball.radius;
        gameState.ball.speedX = 0;
    }
    if (gameState.ball.x + gameState.ball.radius > gameState.canvas.width) {
        gameState.ball.x = gameState.canvas.width - gameState.ball.radius;
        gameState.ball.speedX = 0;
    }

    // Überprüfen, ob die Kugel in ein Loch fällt
    gameState.holes.forEach(hole => {
        const dx = gameState.ball.x - hole.actualX;
        const dy = gameState.ball.y - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance + gameState.ball.radius <= hole.actualRadius * config.holeOverlapThreshold) {
            // Kugel fällt in ein Loch
            gameState.gameOver = true;
            const holeTypeNum = hole.Type;
            if (holeTypeNum === gameState.currentTarget.toString()) {
                alert('Gut gemacht! Du hast Loch ' + gameState.currentTarget + ' erreicht.');
                gameState.currentTarget++;
                if (gameState.currentTarget > config.totalLevels) {
                    // Spiel gewonnen
                    showEndScreen(true);
                    return;
                }
            } else if (holeTypeNum === 'M') {
                // Verlustloch
                gameState.lives--;
                if (gameState.lives <= 0) {
                    // Spiel verloren
                    showEndScreen(false);
                    return;
                } else {
                    alert('Falsches Loch! Du hast noch ' + gameState.lives + ' Leben.');
                }
            }
            // Spiel zurücksetzen
            resetGameLogic();
        }
    });

    // Überprüfen, ob die Kugel unten aus dem Bildschirm fällt
    if (gameState.ball.y - gameState.ball.radius > gameState.canvas.height) {
        gameState.gameOver = true;
        gameState.lives--;
        if (gameState.lives <= 0) {
            // Spiel verloren
            showEndScreen(false);
            return;
        } else {
            alert('Verloren! Du hast noch ' + gameState.lives + ' Leben.');
            resetGame();
        }
    }
}
