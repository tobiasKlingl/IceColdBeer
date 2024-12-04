// src/js/physics.js

import { gameState } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGame } from './gameState.js';
import { updateDisplay, showTemporaryMessage } from './ui.js';

export function applyPhysics() {
    if (gameState.gameOver || gameState.ballInHole) {
        return; // Physikberechnungen stoppen
    }

    const adjustedWidth = gameState.canvas.width / (window.devicePixelRatio || 1);
    const adjustedHeight = gameState.canvas.height / (window.devicePixelRatio || 1);
    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / adjustedWidth;
    const angle = Math.atan(barSlope); // Neigungswinkel der Stange

    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x;

    const isOnBar = (
        gameState.ball.y + gameState.ball.radius >= barYAtBallX - gameState.bar.height / 2 - 0.5 &&
        gameState.ball.y + gameState.ball.radius <= barYAtBallX + gameState.bar.height / 2 + 0.5 &&
        gameState.ball.x >= 0 &&
        gameState.ball.x <= adjustedWidth
    );

    if (isOnBar) {
        // Kugel ist auf der Stange
        // Position der Kugel an die Stange koppeln
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / 2;
        gameState.ball.speedY = 0; // Vertikale Geschwindigkeit auf 0 setzen

        // Schwerkraftkomponente entlang der Stange
        const gravityAlongBar = config.gravity * Math.sin(angle);

        if (Math.abs(gameState.ball.speedX) < 0.01 && Math.abs(gravityAlongBar) < config.staticFrictionThreshold) {
            // Kugel ruht aufgrund der Haftreibung
            gameState.ball.speedX = 0;
        } else {
            // Kugel bewegt sich, kinetische Reibung anwenden
            gameState.ball.speedX += gravityAlongBar;
            gameState.ball.speedX *= config.friction;
        }
    } else {
        // Kugel ist nicht auf der Stange
        gameState.ball.speedY += config.gravity; // Schwerkraft anwenden
    }

    // Position aktualisieren
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Grenzen prüfen und Dämpfung anwenden
    if (gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.x = gameState.ball.radius;
        gameState.ball.speedX = -gameState.ball.speedX * (1 - config.wallBounceDamping);
    }
    if (gameState.ball.x + gameState.ball.radius > adjustedWidth) {
        gameState.ball.x = adjustedWidth - gameState.ball.radius;
        gameState.ball.speedX = -gameState.ball.speedX * (1 - config.wallBounceDamping);
    }

    // Kollision mit Löchern prüfen
    for (let hole of gameState.holes) {
        const dx = gameState.ball.x - hole.actualX;
        const dy = gameState.ball.y - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance + gameState.ball.radius*config.holeOverlapThreshold <= hole.actualRadius) {
            handleHoleCollision(hole);
            return; // Funktion verlassen
        }
    }

    // Prüfen, ob der Ball aus dem Bildschirm fällt
    if (gameState.ball.y - gameState.ball.radius > adjustedHeight) {
        handleBallOutOfBounds();
        return;
    }
}

function handleHoleCollision(hole) {
    gameState.ballInHole = true;
    const holeTypeNum = parseInt(hole.Type);

    if (holeTypeNum === gameState.currentTarget) {
        // Richtiges Loch
        handleCorrectHole();
    } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
        // Falsches Ziel-Loch
        handleIncorrectHole(); // Hier Leben abziehen
    } else {
        // Verlustloch
        handleLossHole();
    }
}

function handleCorrectHole() {
    const messages = [
        '🎉 Fantastisch! Loch ' + gameState.currentTarget + ' getroffen!',
        '🏅 Hervorragend! Weiter zum nächsten Loch!',
        '✨ Super Schuss! Auf zu Loch ' + (gameState.currentTarget + 1) + '!',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    showTemporaryMessage(message, 2000, () => {
        gameState.currentTarget++;
        if (gameState.currentTarget > config.totalLevels) {
            // Spiel gewonnen
            gameState.gameOver = true;
            showEndScreen(true);
        } else {
            resetGame();
            updateDisplay();
        }
    });
}

function handleIncorrectHole() {
    gameState.lives = Math.max(0, gameState.lives - 1); // Leben abziehen
    const messages = [
        '❌ Falsches Loch! Ein Leben verloren.',
        '😓 Das war das falsche Loch. Noch ' + gameState.lives + ' Leben übrig.',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            resetGame();
            updateDisplay();
        });
    }
}

function handleLossHole() {
    gameState.lives = Math.max(0, gameState.lives - 1);
    const messages = [
        '💥 Autsch! Ein Leben verloren!',
        '☠️ Vorsicht! Noch ' + gameState.lives + ' Leben übrig.',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            resetGame();
            updateDisplay();
        });
    }
}

function handleBallOutOfBounds() {
    gameState.ballInHole = true;
    gameState.lives = Math.max(0, gameState.lives - 1);
    const messages = [
        '💥 Oops! Der Ball ist weg!',
        '😵 Ein Leben weniger! Noch ' + gameState.lives + ' Leben übrig.',
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            resetGame();
            updateDisplay();
        });
    }
}
