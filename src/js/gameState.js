// src/js/gameState.js

/**
 * gameState.js
 * Verwalten des Spielzustands und der Initialisierung.
 */

import { config } from './config.js';
import { holesData } from '../data/holeData.js';
import { setupInputHandlers } from './input.js';
import { draw } from './render.js';
import { initializeUI, updateDisplay } from './ui.js';

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
        color: ''
    },
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    lives: config.maxLives,
    currentTarget: 1,
    gameOver: false
};

/**
 * Funktion zum Zurücksetzen des Spiels.
 */
export function resetGame() {
    gameState.gameOver = false;

    // Canvas-Größe aktualisieren
    resizeCanvas();

    // Ball initialisieren
    gameState.ball.x = gameState.canvas.width - config.ballStartOffsetX;
    gameState.ball.y = gameState.canvas.height * config.ballStartOffsetYPercentage;
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
    gameState.ball.radius = config.ballRadius;
    gameState.ball.color = config.ballColor;

    // Stange initialisieren
    const barStartY = gameState.canvas.height * config.barStartYPercentage;
    gameState.bar.leftY = barStartY;
    gameState.bar.rightY = barStartY;
    gameState.bar.height = config.barHeight;
    gameState.bar.color = config.barColor;

    // Löcher skalieren
    gameState.holes.forEach(hole => {
        hole.actualX = hole.x * gameState.canvas.width;
        hole.actualY = hole.y * gameState.canvas.height;
        const scalingFactor = Math.min(gameState.canvas.width, gameState.canvas.height);
        hole.actualRadius = hole.radius * scalingFactor;
    });

    // Timer initialisieren
    if (gameState.currentTarget === 1 && gameState.lives === config.maxLives) {
        gameState.startTime = Date.now();
        gameState.elapsedTime = 0;
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(function() {
            gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateDisplay();
        }, config.timerUpdateInterval);
    }

    // Anzeige aktualisieren
    updateDisplay();
}

/**
 * Funktion zur Initialisierung des Spiels.
 */
export function initializeGame() {
    // Canvas initialisieren
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");

    // Canvas-Größe einstellen
    resizeCanvas();

    // UI initialisieren
    initializeUI();

    // Lochdaten laden
    loadHoleData();

    // Spielvariablen initialisieren
    resetGame();

    // Eingabe-Handler einrichten
    setupInputHandlers();

    // Fenstergrößenänderung behandeln
    window.addEventListener('resize', function() {
        resetGame();
    });

    // Spielschleife starten
    draw();
}

/**
 * Funktion zur Anpassung der Canvas-Größe.
 */
function resizeCanvas() {
    const viewportHeight = window.innerHeight;
    const headerHeight = viewportHeight * (parseFloat(config.headerHeight) / 100);
    const canvasHeight = viewportHeight * config.canvasHeightPercentage;

    gameState.canvas.width = gameState.canvas.parentElement.clientWidth;
    gameState.canvas.height = canvasHeight - headerHeight - (viewportHeight * config.canvasMarginPercentage * 2);
    gameState.canvas.style.width = '100%';
    gameState.canvas.style.height = 'auto';
}

/**
 * Funktion zum Laden der Lochdaten.
 */
function loadHoleData() {
    gameState.holes = holesData.map(hole => ({
        x: hole.X,
        y: hole.Y,
        radius: hole.Radius,
        Type: hole.Type
    }));
}
