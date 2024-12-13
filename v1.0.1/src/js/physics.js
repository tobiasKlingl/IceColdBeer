/**
 * physics.js
 * Enthält die Physikberechnungen für das Spiel.
 */

import { gameState } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGame } from './gameState.js';
import { updateDisplay, showTemporaryMessage } from './ui.js';
import { updateBars } from './input.js';
import { stopHoleMovement } from './holeMovement.js';

export function applyPhysics(deltaTime) {
    if (gameState.gameOver || gameState.ballInHole) {
        return; // Physikberechnungen stoppen
    }

    // const gravityInPixels = config.gravity * config.metersToPhysicalPixels;
    const gravityInPixels = config.gravity * config.metersToLogicalPixels;

    // Aktualisiere die Position der Stangen basierend auf der Eingabe
    updateBars(deltaTime);

    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / config.canvasWidthInLogicalPixels;
    const angle = Math.atan(barSlope); // Neigungswinkel der Stange

    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x;

    const isOnBar = (
        gameState.ball.y + gameState.ball.radius >= barYAtBallX - gameState.bar.height / 2 - 5 &&
        gameState.ball.y + gameState.ball.radius <= barYAtBallX + gameState.bar.height / 2 + 5 &&
        gameState.ball.x >= 0 &&
        gameState.ball.x <= config.canvasWidthInLogicalPixels
    );

    if (config.withLogging == true) {
        console.log("config.canvasWidthInLogicalPixels = " + config.canvasWidthInLogicalPixels)
        console.log("config.canvasWidthInPhysicalPixels = " + config.canvasWidthInPhysicalPixels)
        console.log("config.metersToPhysicalPixels = " + config.metersToPhysicalPixels)
        console.log("config.physicalPixelsToMeters = " + config.physicalPixelsToMeters)
        console.log("config.metersToLogicalPixels = " + config.metersToLogicalPixels)
        console.log("config.logicalPixelsToMeters = " + config.logicalPixelsToMeters)
        console.log("deltaTime = " + deltaTime)
        console.log("gameState.ball.x = " + gameState.ball.x)
        console.log("gameState.ball.y = " + gameState.ball.y)
        console.log("gameState.ball.speedX = " + gameState.ball.speedX)
        console.log("gameState.ball.speedY = " + gameState.ball.speedY)
        console.log("gameState.bar.leftYspeed = " + gameState.bar.leftYSpeed)
        console.log("gameState.bar.rightYspeed = " + gameState.bar.rightYSpeed)
        console.log("angle = " + angle)
    }

    if (isOnBar) {
        // Kugel ist auf der Stange
        // Position der Kugel an die Stange koppeln
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / 2;
        gameState.ball.speedY = 0; // Vertikale Geschwindigkeit auf 0 setzen

        // Schwerkraftkomponente entlang der Stange
        const gravityForceAlongBar = gravityInPixels * Math.sin(angle);

        // Haftreibung prüfen
        const normalForce = gravityInPixels * Math.cos(angle);
        const staticFrictionForce = config.staticFrictionCoefficient * normalForce

        if (config.withLogging == true) {
            console.log("normalForce = " + normalForce)
            console.log("gravityForceAlongBar = " + gravityForceAlongBar)
            console.log("staticFrictionForce: " + staticFrictionForce)
        }

        // Haftreibung prüfen
        if (Math.abs(gameState.ball.speedX) < 1e-5) { // Kugel steht fast still
            if (Math.abs(gravityForceAlongBar) <= Math.abs(staticFrictionForce)) {
                gameState.ball.speedX = 0;
            } else {
                // Kugel bewegt sich, kinetische Reibung anwenden
                const kineticFrictionForce = Math.sign(gameState.ball.speedX) * config.kineticFrictionCoefficient * normalForce;
                const netForce = gravityForceAlongBar - kineticFrictionForce;
                gameState.ball.speedX += netForce * deltaTime;
            }
        } else {
             // Kugel bewegt sich bereits, kinetische Reibung anwenden
             const kineticFrictionForce = Math.sign(gameState.ball.speedX) * config.kineticFrictionCoefficient * normalForce;
             const netForce = gravityForceAlongBar - kineticFrictionForce;
             gameState.ball.speedX += netForce * deltaTime;
        }
    } else {
        // Kugel ist nicht auf der Stange
        gameState.ball.speedY += gravityInPixels * deltaTime; // Schwerkraft anwenden
    }

    // Quadratischer Luftwiderstand in der Luft
    applyAirResistance(gameState.ball, deltaTime);

    // Position aktualisieren
    gameState.ball.x += gameState.ball.speedX * deltaTime;
    gameState.ball.y += gameState.ball.speedY * deltaTime;

    // Grenzen prüfen und Dämpfung anwenden
    if (gameState.ball.x - gameState.ball.radius < 0) {
        gameState.ball.x = gameState.ball.radius;
        gameState.ball.speedX = - gameState.ball.speedX * (1 - config.wallBounceDamping);
    }
    if (gameState.ball.x + gameState.ball.radius > config.canvasWidthInLogicalPixels) {
        gameState.ball.x = config.canvasWidthInLogicalPixels - gameState.ball.radius;
        gameState.ball.speedX = -gameState.ball.speedX * (1 - config.wallBounceDamping);
    }

    // Kollision mit Löchern prüfen
    for (let hole of gameState.holes) {
        const dx = gameState.ball.x - hole.actualX;
        const dy = gameState.ball.y - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const holeTypeNum = parseInt(hole.Type, 10);
        let holeOverlapThreshold = holeTypeNum <= config.totalLevels ? config.holeOverlapThresholdTarget : config.holeOverlapThresholdMiss;

        if (distance + gameState.ball.radius * holeOverlapThreshold <= hole.actualRadius) {
            handleHoleCollision(hole);
            return; // Funktion verlassen
        }
    }

    // Prüfen, ob der Ball aus dem Bildschirm fällt
    if (gameState.ball.y - gameState.ball.radius > config.canvasHeightInLogicalPixels) {
        handleBallOutOfBounds();
        return;
    }
}

/**
 * Funktion zur Berechnung des Luftwiderstandes
 * @param {*} ball
 */
function applyAirResistance(ball, deltaTime) {
    const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2); // Betrag der Geschwindigkeit in Pixeln/s
    //const speedInMeters = speed * config.physicalPixelsToMeters; // Geschwindigkeit in m/s
    const speedInMeters = speed * config.logicalPixelsToMeters; // Geschwindigkeit in m/s

    if (speed < 1e-5) return; // Kein Luftwiderstand, wenn keine Bewegung

    // Luftwiderstandskraft (SI-Einheiten)
    const dragForce = 0.5 * config.airDensity * config.dragCoefficient * Math.PI *
    //Math.pow(ball.radius * config.physicalPixelsToMeters, 2) * Math.pow(speedInMeters, 2);
    Math.pow(ball.radius * config.logicalPixelsToMeters, 2) * Math.pow(speedInMeters, 2);

    // Kraft in SI -> Beschleunigung in SI -> zurück in Pixel
    const dragAcceleration = dragForce / config.ballMass;
    const dragAccelerationInPixels = dragAcceleration * config.metersToLogicalPixels;

    const dragX = (ball.speedX / speed) * dragAccelerationInPixels;
    const dragY = (ball.speedY / speed) * dragAccelerationInPixels;

    if (config.withLogging == true) {
        console.log("dragX = " + dragX)
        console.log("dragY = " + dragY)
    }

    ball.speedX -= dragX * deltaTime;
    ball.speedY -= dragY * deltaTime;
}

/**
 * Funktion zur Handhabung von Kollisionen mit Löchern.
 * @param {Object} hole - Das Loch, mit dem kollidiert wurde.
 */
function handleHoleCollision(hole) {
    gameState.ballInHole = true;
    const holeTypeNum = parseInt(hole.Type, 10);

    if (holeTypeNum === gameState.currentTarget) {
        handleCorrectHole();
    } else if (holeTypeNum >= 1 && holeTypeNum <= config.totalLevels) {
        handleIncorrectHole();
    } else {
        handleLossHole();
    }
}

/**
 * Funktion zur Handhabung des richtigen Lochs.
 */
function handleCorrectHole() {
    const messages = [
        '🎉 Fantastisch! Loch ' + gameState.currentTarget + ' getroffen!',
        '🏅 Hervorragend! Weiter zum nächsten Loch!',
        '✨ Super Schuss! Auf zu Loch ' + (gameState.currentTarget + 1) + '!',
    ];

    gameState.timeLastHole = gameState.elapsedTime;
    gameState.times[`time_${gameState.currentTarget}`] = gameState.elapsedTime;

    // Lochbewegung stoppen
    if (gameState.mode === 'expert') {
        stopHoleMovement();
    }

    const message = messages[Math.floor(Math.random() * messages.length)];
    showTemporaryMessage(message, 1000, () => {
        gameState.currentTarget++;
        if (gameState.currentTarget > config.totalLevels) {
            // Spiel gewonnen
            gameState.gameOver = true;
            updateDisplay();
            showEndScreen(true); // 'true' bedeutet, dass das Spiel gewonnen wurde
        } else {
            resetGame();
            updateDisplay();
            // Endbildschirm ausblenden
            document.getElementById('endScreen').style.display = 'none';
            // Spiel-Elemente anzeigen
            document.querySelector('header').style.display = 'flex';
            document.querySelector('.game-container').style.display = 'block';
            document.querySelector('.game-info').style.display = 'flex';
            document.querySelector('.controls').style.display = 'flex';
        }
    });
}

/**
 * Funktion zur Handhabung eines falschen Lochs.
 */
function handleIncorrectHole() {
    gameState.lives = Math.max(0, gameState.lives - 1); // Leben abziehen
    const messages = [
        '❌ Falsches Loch! Ein Leben verloren.',
        '😓 Das war das falsche Loch. Noch ' + gameState.lives + ' Leben übrig.',
    ];

    // Lochbewegung stoppen
    if (gameState.mode === 'expert') {
        stopHoleMovement();
    }

    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            resetGame();
            updateDisplay();
            // Endbildschirm ausblenden
            document.getElementById('endScreen').style.display = 'none';
            // Spiel-Elemente anzeigen
            document.querySelector('header').style.display = 'flex';
            document.querySelector('.game-container').style.display = 'block';
            document.querySelector('.game-info').style.display = 'flex';
            document.querySelector('.controls').style.display = 'flex';
        });
    }
}

/**
 * Funktion zur Handhabung eines Verlustlochs.
 */
function handleLossHole() {
    gameState.lives = Math.max(0, gameState.lives - 1);
    const messages = [
        '💥 Autsch! Ein Leben verloren!',
        '☠️ Vorsicht! Noch ' + gameState.lives + ' Leben übrig.',
    ];

    // Lochbewegung stoppen
    if (gameState.mode === 'expert') {
        stopHoleMovement();
    }

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

/**
 * Funktion zur Handhabung des Balls, der aus dem Bildschirm fällt.
 */
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
