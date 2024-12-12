// src/js/physics.js
import { gameState } from './gameState.js';
import { config } from './config.js';
import { showEndScreen } from './highscore.js';
import { resetGame } from './gameState.js';
import { updateDisplay, showTemporaryMessage } from './ui.js';
import { updateBars } from './input.js';
import { stopHoleMovement } from './holeMovement.js';
import { Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export function applyPhysics(deltaTime) {
    const subSteps = config.physics.subSteps;
    const dt = deltaTime / subSteps;

    for (let i = 0; i < subSteps; i++) {
        if (gameState.gameOver || gameState.ballInHole) {
            break;
        }
        applyPhysicsStep(dt);
    }
}

function applyPhysicsStep(dt) {
    if (gameState.gameOver || gameState.ballInHole) {
        return;
    }

    updateBars(dt);

    const W = config.canvasWidthInLogicalPixels;
    const startX = W * config.bar.startPercentage;
    const endX = W * config.bar.endPercentage;

    const barSlope = (gameState.bar.rightY - gameState.bar.leftY) / W;
    const angle = Math.atan(barSlope);

    const barYAtBallX = gameState.bar.leftY + barSlope * gameState.ball.x;
    const isOnBar = (
        gameState.ball.y + gameState.ball.radius >= barYAtBallX - gameState.bar.height / 2 - 5 &&
        gameState.ball.y + gameState.ball.radius <= barYAtBallX + gameState.bar.height / 2 + 5
    );

    const gravityInPixels = config.physics.gravity * config.metersToLogicalPixels;

    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    if (isOnBar) {
        gameState.ball.y = barYAtBallX - gameState.ball.radius - gameState.bar.height / (2*cosAngle);
        gameState.ball.speedY = 0;

        const gravityForceAlongBar = gravityInPixels * sinAngle;
        const normalForce = gravityInPixels * cosAngle;

        let frictionDirection = 0;
        if (gameState.ball.speedX !== 0) {
            frictionDirection = -Math.sign(gameState.ball.speedX);
        } else {
            frictionDirection = -Math.sign(sinAngle);
        }

        const staticFrictionForce = frictionDirection * config.physics.staticFrictionCoefficient * normalForce;
        const rollingConditionFactor = 2 / 7;
        const factorRollingPart = config.physics.staticFrictionCoefficient / (rollingConditionFactor * Math.abs(barSlope));
        const factorKineticPart = (1 - factorRollingPart);

        let accelerationForce = 0;

        if (factorRollingPart >= 1) {
            const rollingFrictionForce = frictionDirection * config.physics.rollingFrictionCoefficient * normalForce;
            if (Math.sign(gravityForceAlongBar) == frictionDirection || Math.abs(gravityForceAlongBar) - Math.abs(rollingFrictionForce) > 0){
                accelerationForce = (5/7) * (gravityForceAlongBar + rollingFrictionForce);
            } else {
                accelerationForce = 0;
            }
        } else {
            const rollingFrictionForce = frictionDirection * config.physics.rollingFrictionCoefficient * normalForce;
            const kineticFrictionForce = frictionDirection * config.physics.kineticFrictionCoefficient * normalForce;

            if (Math.sign(gravityForceAlongBar) == frictionDirection || Math.abs(gravityForceAlongBar) - Math.abs(kineticFrictionForce) - Math.abs(rollingFrictionForce) > 0){
                accelerationForce = factorRollingPart * (5/7) * (gravityForceAlongBar + rollingFrictionForce) + factorKineticPart * (gravityForceAlongBar + kineticFrictionForce);
            } else {
                accelerationForce = 0;
            }
        }

        gameState.ball.speedX += accelerationForce * dt;
    } else {
        gameState.ball.speedY += gravityInPixels * dt;
    }


    let effectiveStart = startX;
    let effectiveEnd = endX;

    const oldX = gameState.ball.x;
    const oldY = gameState.ball.y;
    gameState.ball.x = oldX + gameState.ball.speedX * dt;
    gameState.ball.y = oldY + gameState.ball.speedY * dt;

    if (angle > 0) {
        effectiveEnd += sinAngle * gameState.ball.radius*1.5;
    } else if (angle < 0) {
        effectiveStart -= Math.abs(sinAngle) * gameState.ball.radius*1.5;
    }

    if (gameState.ball.x - gameState.ball.radius < effectiveStart) {
        gameState.ball.x = effectiveStart + gameState.ball.radius;
        gameState.ball.speedX = -gameState.ball.speedX * (1 - config.physics.wallBounceDamping);
    }
    if (gameState.ball.x + gameState.ball.radius > effectiveEnd) {
        gameState.ball.x = effectiveEnd - gameState.ball.radius;
        gameState.ball.speedX = -gameState.ball.speedX * (1 - config.physics.wallBounceDamping);
    }

    // Kollision mit Löchern
    for (let hole of gameState.holes) {
        const dx = gameState.ball.x - hole.actualX;
        const dy = gameState.ball.y - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const holeTypeNum = parseInt(hole.Type, 10);
        let holeOverlapThreshold;

        if (holeTypeNum === gameState.currentTarget) {
            if (Math.abs(gameState.ball.speedX) > config.holes.holeOverlapThresholdTargetMaxVelocity) {
                holeOverlapThreshold = config.holes.holeOverlapThresholdTargetMax;
            } else {
                const delta = (config.holes.holeOverlapThresholdTargetMin - config.holes.holeOverlapThresholdTargetMax) / config.holes.holeOverlapThresholdTargetMaxVelocity;
                holeOverlapThreshold = config.holes.holeOverlapThresholdTargetMin - delta * Math.abs(gameState.ball.speedX);
            }
        } else {
            holeOverlapThreshold = config.holes.holeOverlapThresholdMiss;
        }

        let currentHoleRadius = hole.actualRadius;

        // Wenn expert Modus und aktuelles Zielloch: Effektiven Radius anpassen
        if (gameState.mode !== 'beginner' && holeTypeNum === gameState.currentTarget) {
            const s = gameState.shutter;

            if (s.state === 'closing' || s.state === 'opening') {
                currentHoleRadius = hole.actualRadius * (1 - s.progress);
            } else if (s.state === 'closed') {
                currentHoleRadius = 0;
            }
        }

        // Kollisionsprüfung mit aktuellem effektiven Radius
        if (distance + gameState.ball.radius * holeOverlapThreshold <= currentHoleRadius) {
            handleHoleCollision(hole);
            return;
        }
    }

    if (gameState.ball.y - gameState.ball.radius > config.canvasHeightInLogicalPixels) {
        handleBallOutOfBounds();
        return;
    }
}

function handleHoleCollision(hole) {
    gameState.ballInHole = true;
    stopHoleMovement();
    const holeTypeNum = parseInt(hole.Type, 10);

    if (holeTypeNum === gameState.currentTarget) {
        handleCorrectHole();
    } else if (holeTypeNum >= 1 && holeTypeNum <= config.gameplay.totalLevels) {
        handleIncorrectHole();
    } else {
        handleLossHole();
    }
}

function handleCorrectHole() {
    const messages = [
        '🎉 Fantastisch! Loch ' + gameState.currentTarget + ' getroffen!',
        '🏅 Hervorragend! Weiter zum nächsten Loch!',
        '✨ Super Schuss! Auf zu Loch ' + (gameState.currentTarget + 1) + '!'
    ];

    const timeForLevel = gameState.elapsedTime - gameState.timeLastHole;
    const livesForLevel = gameState.livesLastHole - gameState.lives;
    gameState.level_info.push({
        'level': gameState.currentTarget,
        'time': timeForLevel,
        'lives': livesForLevel,
        'date': Timestamp.now(),
    });

    gameState.timeLastHole = gameState.elapsedTime;
    gameState.livesLastHole = gameState.lives;

    const message = messages[Math.floor(Math.random() * messages.length)];
    showTemporaryMessage(message, 1000, () => {
        if (gameState.overlayCancelled) return;
        gameState.currentTarget++;
        if (gameState.currentTarget > config.gameplay.totalLevels) {
            gameState.gameOver = true;
            updateDisplay();
            showEndScreen(true);
        } else {
            resetGame();
            updateDisplay();
            document.getElementById('endScreen').style.display = 'none';
            document.querySelector('header').style.display = 'flex';
            document.querySelector('.game-container').style.display = 'block';
            document.querySelector('.game-info').style.display = 'flex';
            document.querySelector('.controls').style.display = 'flex';
        }
    });
}

function handleIncorrectHole() {
    gameState.lives = Math.max(0, gameState.lives - 1);
    const messages = [
        '❌ Falsches Loch! Ein Leben verloren.',
        '😓 Das war das falsche Loch. Noch ' + gameState.lives + ' Leben übrig.'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            if (gameState.overlayCancelled) return;
            resetGame();
            updateDisplay();
            document.getElementById('endScreen').style.display = 'none';
            document.querySelector('header').style.display = 'flex';
            document.querySelector('.game-container').style.display = 'block';
            document.querySelector('.game-info').style.display = 'flex';
            document.querySelector('.controls').style.display = 'flex';
        });
    }
}

function handleLossHole() {
    gameState.lives = Math.max(0, gameState.lives - 1);
    const messages = [
        '💥 Autsch! Ein Leben verloren!',
        '☠️ Vorsicht! Noch ' + gameState.lives + ' Leben übrig.'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            if (gameState.overlayCancelled) return;
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
        '😵 Ein Leben weniger! Noch ' + gameState.lives + ' Leben übrig.'
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];

    if (gameState.lives <= 0) {
        gameState.gameOver = true;
        updateDisplay();
        showEndScreen(false);
    } else {
        showTemporaryMessage(message, 2000, () => {
            if (gameState.overlayCancelled) return;
            resetGame();
            updateDisplay();
        });
    }
}
