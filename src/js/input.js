// src/js/input.js

import { gameState } from './gameState.js';
import { config } from './config.js';
import { resetGame, resetTimer } from './gameState.js';

export function setupInputHandlers() {
    setupButton('leftUp', 'left', -1);
    setupButton('leftDown', 'left', 1);
    setupButton('rightUp', 'right', -1);
    setupButton('rightDown', 'right', 1);

    document.getElementById('gameResetButton').addEventListener('click', () => {
        gameState.lives = config.maxLives;
        gameState.currentTarget = 1;
        resetGame();
        resetTimer(); // Timer zurücksetzen beim Neustart
    });
}

function setupButton(buttonId, side, direction) {
    const button = document.getElementById(buttonId);
    let intervalId;

    const startMoving = () => {
        if (gameState.gameOver || gameState.ballInHole) return;
        adjustBar(side, direction);
        intervalId = setInterval(() => {
            if (gameState.gameOver || gameState.ballInHole) {
                clearInterval(intervalId);
                return;
            }
            adjustBar(side, direction);
        }, 20);
    };

    const stopMoving = () => {
        clearInterval(intervalId);
    };

    button.addEventListener('mousedown', startMoving);
    button.addEventListener('mouseup', stopMoving);
    button.addEventListener('mouseleave', stopMoving);

    // Für Touch-Geräte
    button.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Verhindert zusätzliches Klick-Event
        startMoving();
    }, { passive: false });

    button.addEventListener('touchend', stopMoving);
}

function adjustBar(side, direction) {
    const moveAmount = config.baseBarSpeed * direction * 5;

    if (side === 'left') {
        const newLeftY = Math.min(
            gameState.canvas.height / (window.devicePixelRatio || 1) - gameState.bar.height / 2,
            Math.max(0, gameState.bar.leftY + moveAmount)
        );
        gameState.bar.leftY = newLeftY;

        // Kugelposition anpassen
        adjustBallPosition();
    } else if (side === 'right') {
        const newRightY = Math.min(
            gameState.canvas.height / (window.devicePixelRatio || 1) - gameState.bar.height / 2,
            Math.max(0, gameState.bar.rightY + moveAmount)
        );
        gameState.bar.rightY = newRightY;

        // Kugelposition anpassen
        adjustBallPosition();
    }
}

function adjustBallPosition() {
    const adjustedWidth = gameState.canvas.width / (window.devicePixelRatio || 1);
    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / adjustedWidth;
    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x;

    const isOnBar = (
        gameState.ball.y + gameState.ball.radius >= barYAtBallX - gameState.bar.height / 2 - 0.5 &&
        gameState.ball.y + gameState.ball.radius <= barYAtBallX + gameState.bar.height / 2 + 0.5 &&
        gameState.ball.x >= 0 &&
        gameState.ball.x <= adjustedWidth
    );

    if (isOnBar) {
        // Kugelposition entsprechend der Bewegung der Stange anpassen
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / 2;

        // Vertikale Geschwindigkeit der Kugel auf 0 setzen
        gameState.ball.speedY = 0;
    }
}
