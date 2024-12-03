// src/js/physics.js

/**
 * physics.js
 * Contains the game's physics logic, including gravity, friction, and collision detection.
 */

import { gameState } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGame } from './gameState.js';
import { updateDisplay } from './ui.js';

/**
 * Function to apply physics to the ball.
 */
export function applyPhysics() {
    if (gameState.gameOver) {
        return;
    }

    // Apply gravity
    gameState.ball.speedY += config.gravity;

    // Update position
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Check collision with the bar
    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / gameState.canvas.width;
    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x;

    if (
        gameState.ball.y + gameState.ball.radius > barYAtBallX - gameState.bar.height / 2 &&
        gameState.ball.y + gameState.ball.radius < barYAtBallX + gameState.bar.height &&
        gameState.ball.x > 0 &&
        gameState.ball.x < gameState.canvas.width
    ) {
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / 2;
        gameState.ball.speedY = 0;

        let sinTheta = barSlope / Math.sqrt(1 + barSlope * barSlope);
        gameState.ball.speedX += config.gravity * sinTheta;
        gameState.ball.speedX *= config.friction;
    }

    // Check boundaries
    if (gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.x = gameState.ball.radius;
        gameState.ball.speedX = 0;
    }
    if (gameState.ball.x + gameState.ball.radius > gameState.canvas.width) {
        gameState.ball.x = gameState.canvas.width - gameState.ball.radius;
        gameState.ball.speedX = 0;
    }

    // Check collision with holes
    gameState.holes.forEach(hole => {
        const dx = gameState.ball.x - hole.actualX;
        const dy = gameState.ball.y - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const combinedRadius = hole.actualRadius + gameState.ball.radius * (1 - config.holeOverlapThreshold);

        if (distance <= combinedRadius) {
            const holeTypeNum = parseInt(hole.Type);

            if (holeTypeNum === gameState.currentTarget) {
                // Correct hole
                alert('Gut gemacht! Du hast Loch ' + gameState.currentTarget + ' erreicht.');
                gameState.currentTarget++;
                if (gameState.currentTarget > config.totalLevels) {
                    // Game won
                    gameState.gameOver = true;
                    showEndScreen(true);
                    return;
                } else {
                    resetGame();
                    updateDisplay();
                    return;
                }
            } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
                // Wrong target hole
                alert('Falsches Loch! Versuche es erneut.');
                resetGame();
                updateDisplay();
                return;
            } else {
                // Miss hole
                gameState.lives--;
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    showEndScreen(false);
                    return;
                } else {
                    alert('Verlustloch getroffen! Du hast noch ' + gameState.lives + ' Leben.');
                    resetGame();
                    updateDisplay();
                    return;
                }
            }
        }
    });

    // Check if the ball falls off the screen
    if (gameState.ball.y - gameState.ball.radius > gameState.canvas.height) {
        gameState.lives--;
        if (gameState.lives <= 0) {
            gameState.gameOver = true;
            showEndScreen(false);
            return;
        } else {
            alert('Verloren! Du hast noch ' + gameState.lives + ' Leben.');
            resetGame();
            updateDisplay();
            return;
        }
    }
}
