// src/js/gameState.js
import { config } from './config.js';
import { holesDataBeginner } from '../data/holesDataBeginner.js';
import { holesDataAdvanced } from '../data/holesDataAdvanced.js';
import { holesDataExpert } from '../data/holesDataExpert.js';
import { setupInputHandlers } from './input.js';
import { draw } from './render.js';
import { initializeUI, updateDisplay, hideOverlay } from './ui.js';
import { startHoleMovements, stopHoleMovement, updateHolePositions } from './holeMovement.js';
import { setCSSVariables } from './utils.js';

export const gameState = {
    canvas: null,
    ctx: null,
    holes: [],
    ball: {
        x: 0,
        y: 0,
        speedX: 0,
        speedY: 0,
        radius: 0,
        color: ''
    },
    bar: {
        leftY: 0,
        rightY: 0,
        height: 0,
        color: '',
        leftYSpeed: 0,
        rightYSpeed: 0
    },
    startTime: null,
    elapsedTime: 0,
    timeLastHole: 0,
    level_info: [],
    timerInterval: null,
    gameEndTimeout: null,
    lives: config.gameplay.maxLives,
    currentTarget: 1,
    gameOver: false,
    ballInHole: false,
    mode: null,
    viewMode: 'beginner',
    animationFrameId: null,
    overlayCancelled: false,

    // DOM references
    livesDisplayElement: null,
    currentHoleElement: null,
    timerDisplayElement: null,
    currentModeElement: null,
    messageOverlayElement: null
};

export function resetGame() {
    gameState.gameOver = false;
    gameState.ballInHole = false;
    hideOverlay();
    gameState.overlayCancelled = true;


    resizeCanvas();
    initializeBarAndBall();
    loadHoleData();
    scaleAndPositionHoles(gameState.mode);
    updateDisplay();
    stopHoleMovement();

    // Lochbewegung initialisieren
    if (['expert', 'advanced'].includes(gameState.mode)) {
        startHoleMovements(); // Startet die Lochbewegung
    }

    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
}

export function resetGameStats() {
    gameState.lives = config.gameplay.maxLives;
    gameState.currentTarget = 1;
}

export function resetTimer() {
    clearInterval(gameState.timerInterval);
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    gameState.timeLastHole = 0;
    gameState.timerInterval = setInterval(function () {
        gameState.elapsedTime = Date.now() - gameState.startTime;
        updateDisplay();
    }, config.physics.timerUpdateInterval);

    clearTimeout(gameState.gameEndTimeout);
    gameState.gameEndTimeout = setTimeout(function () {
        Swal.fire({
            title: 'Spielzeit abgelaufen!',
            text: 'Du hast die maximale Spielzeit erreicht.',
            icon: 'info',
            confirmButtonText: 'Zurück zum Start',
            background: '#2c2c2c',
            color: '#ffffff',
        }).then(() => {
            returnToModeSelectionScreen();
        });
    }, config.physics.maxGameDuration);
}

function returnToModeSelectionScreen() {
    document.getElementById('modeSelectionScreen').style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.game-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.game-info').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';

    gameState.gameOver = true;
    resetGame();
    clearInterval(gameState.timerInterval);
    clearTimeout(gameState.gameEndTimeout);
}

function initializeBarAndBall() {
    const barStartY = config.canvasHeightInLogicalPixels * config.bar.startYPercentage;
    gameState.bar.leftY = barStartY;
    gameState.bar.rightY = barStartY;
    gameState.bar.leftYSpeed = 0;
    gameState.bar.rightYSpeed = 0;
    gameState.bar.height = config.bar.height;
    gameState.bar.color = config.bar.color;

    gameState.ball.radius = config.ball.radiusFraction * config.canvasWidthInLogicalPixels;
    gameState.ball.radiusInMeters = gameState.ball.radius * config.logicalPixelsToMeters;
    gameState.ball.color = config.ball.color;

    const startX = config.canvasWidthInLogicalPixels * config.ball.startXFraction;
    gameState.ball.x = startX;
    gameState.ball.y = gameState.bar.leftY - gameState.ball.radius - gameState.bar.height / 2;
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
}

function scaleAndPositionHoles(mode) {
    const scalingFactor = Math.min(config.canvasWidthInLogicalPixels, config.canvasHeightInLogicalPixels);
    let scaleFactorHoleVelocity = 1;
    if (mode === 'advanced') {
        scaleFactorHoleVelocity = config.holes.scaleFactorHoleVelocityAdvanced;
    } else if (mode === 'extrem') {
        scaleFactorHoleVelocity = config.holes.scaleFactorHoleVelocityExtrem;
    }

    config.holes.scaleFactorHoleVelocityAdvanced;
    gameState.holes.forEach(hole => {
        hole.actualX = hole.x * config.canvasWidthInLogicalPixels;
        hole.actualY = hole.y * config.canvasHeightInLogicalPixels;
        hole.actualRadius = hole.radius * scalingFactor;
        if (hole.movement && hole.movement.type !== 'Stationary') {
            switch (hole.movement.type) {
                case 'LeftRight':
                    hole.movement.scaledMagnitude = hole.movement.magnitude * config.canvasWidthInLogicalPixels;
                    hole.movement.scaledVelocity = hole.movement.velocity * config.canvasWidthInLogicalPixels * scaleFactorHoleVelocity;
                    break;
                case 'UpDown':
                    hole.movement.scaledMagnitude = hole.movement.magnitude * config.canvasHeightInLogicalPixels;
                    hole.movement.scaledVelocity = hole.movement.velocity * config.canvasHeightInLogicalPixels * scaleFactorHoleVelocity;
                    break;
                case 'Circle':
                    hole.movement.scaledRadius = hole.movement.radius * scalingFactor;
                    hole.movement.scaledAngularVelocity = hole.movement.angularVelocity * scaleFactorHoleVelocity;
                    break;
                case 'Rectangle':
                    hole.movement.scaledWidth = hole.movement.width * config.canvasWidthInLogicalPixels;
                    hole.movement.scaledHeight = hole.movement.height * config.canvasHeightInLogicalPixels;
                    hole.movement.scaledVelocity = hole.movement.velocity * scalingFactor * scaleFactorHoleVelocity;
                    break;
                default:
                    console.warn(`Unbekannter Bewegungstyp: ${hole.movement.type}`);
                    break;
            }
        }
    });
}

export function initializeGame() {
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");

    setCSSVariables();
    resizeCanvas();

    // currentTarget am Spielstart auf 1
    gameState.currentTarget = 1;

    // DOM Elemente cachen
    gameState.livesDisplayElement = document.getElementById('lives');
    gameState.currentHoleElement = document.getElementById('currentHole');
    gameState.timerDisplayElement = document.getElementById('timer');
    gameState.currentModeElement = document.getElementById('currentMode');
    gameState.messageOverlayElement = document.getElementById('messageOverlay');

    initializeUI();
    resetGame();
    resetTimer();
    setupInputHandlers();

    window.addEventListener('resize', function () {
        resetGame();
    });

    if (gameState.animationFrameId === null) {
        gameState.lastTimestamp = performance.now();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function gameLoop(timestamp) {
    if (!gameState.lastTimestamp) {
        gameState.lastTimestamp = timestamp;
    }
    const deltaTime = (timestamp - gameState.lastTimestamp) / 1000;
    gameState.lastTimestamp = timestamp;

    updateHolePositions(deltaTime);
    draw(deltaTime);
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const headerHeight = viewportHeight * (parseFloat(config.display.headerHeight) / 100);

    const availableHeight = viewportHeight - headerHeight;
    const canvasWidthInLogicalPixels = viewportWidth * 0.95;
    const canvasHeightInLogicalPixels = availableHeight * config.display.canvasHeightPercentage;
    const dpr = window.devicePixelRatio || 1;

    gameState.canvas.width = canvasWidthInLogicalPixels * dpr;
    gameState.canvas.height = canvasHeightInLogicalPixels * dpr;
    gameState.canvas.style.width = `${canvasWidthInLogicalPixels}px`;
    gameState.canvas.style.height = `${canvasHeightInLogicalPixels}px`;
    gameState.ctx.setTransform(1, 0, 0, 1, 0, 0);
    gameState.ctx.scale(dpr, dpr);

    config.canvasWidthInLogicalPixels = canvasWidthInLogicalPixels;
    config.canvasHeightInLogicalPixels = canvasHeightInLogicalPixels;
    config.canvasWidthInPhysicalPixels = gameState.canvas.width;
    config.canvasHeightInPhysicalPixels = gameState.canvas.height;

    config.metersToLogicalPixels = config.canvasWidthInLogicalPixels / config.realGameWidthInMeters;
    config.logicalPixelsToMeters = config.realGameWidthInMeters / config.canvasWidthInLogicalPixels;
    config.metersToPhysicalPixels = config.canvasWidthInPhysicalPixels / config.realGameWidthInMeters;
    config.physicalPixelsToMeters = config.realGameWidthInMeters / config.canvasWidthInPhysicalPixels;
}

function loadHoleData() {
    if (gameState.mode == 'beginner') {
        gameState.holes = holesDataBeginner.map(hole => ({
            x: hole.X,
            y: hole.Y,
            radius: hole.Radius,
            Type: hole.Type,
            movement: hole.movement
        }));
    } else if (gameState.mode == 'advanced') {
        gameState.holes = holesDataAdvanced.map(hole => ({
            x: hole.X,
            y: hole.Y,
            radius: hole.Radius,
            Type: hole.Type,
            movement: hole.movement
        }));
    } else {
        gameState.holes = holesDataExpert.map(hole => ({
            x: hole.X,
            y: hole.Y,
            radius: hole.Radius,
            Type: hole.Type,
            movement: hole.movement
        }));
    }
}