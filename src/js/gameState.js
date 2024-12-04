// src/js/gameState.js

/**
 * gameState.js
 * Verwalten des Spielzustands und der Initialisierung.
 */

import { config } from './config.js';
import { holesData } from '../data/holesData.js';
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
        color: '',
        leftYSpeed: 0,   // Hinzugefügt
        rightYSpeed: 0   // Hinzugefügt
    },
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    lives: config.maxLives,
    currentTarget: 1,
    gameOver: false,
    ballInHole: false
};

export function resetGame() {
    gameState.gameOver = false;
    gameState.ballInHole = false;
    document.body.classList.remove('showing-end-screen');

    // Canvas-Größe aktualisieren
    resizeCanvas();

    // Stange und Kugel initialisieren
    initializeBarAndBall();

    // Löcher skalieren und Position anpassen
    scaleAndPositionHoles();

    // Anzeige aktualisieren
    updateDisplay();
}

export function resetTimer() {
    // Timer zurücksetzen
    clearInterval(gameState.timerInterval);
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    gameState.timerInterval = setInterval(function() {
        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        updateDisplay();
    }, config.timerUpdateInterval);
}

function initializeBarAndBall() {
    const adjustedWidth = gameState.canvas.width / (window.devicePixelRatio || 1);
    const adjustedHeight = gameState.canvas.height / (window.devicePixelRatio || 1);

    // Stange initialisieren
    const barStartY = adjustedHeight * config.barStartYPercentage;
    gameState.bar.leftY = barStartY;
    gameState.bar.rightY = barStartY;
    gameState.bar.leftYSpeed = 0;  // Initialisieren
    gameState.bar.rightYSpeed = 0; // Initialisieren
    gameState.bar.height = config.barHeight;
    gameState.bar.color = config.barColor;

    // Kugel initialisieren
    gameState.ball.radius = config.ballRadius;
    gameState.ball.color = config.ballColor;
    gameState.ball.x = adjustedWidth * 0.9; // Startet bei 90% der Breite
    gameState.ball.y = gameState.bar.leftY - gameState.ball.radius - gameState.bar.height / 2;
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
}

function scaleAndPositionHoles() {
    gameState.holes.forEach(hole => {
        const adjustedWidth = gameState.canvas.width / (window.devicePixelRatio || 1);
        const adjustedHeight = gameState.canvas.height / (window.devicePixelRatio || 1);

        hole.actualX = hole.x * adjustedWidth;
        const deltaY = config.deltaYFraction * adjustedHeight;
        hole.actualY = hole.y * adjustedHeight + deltaY;
        const scalingFactor = Math.min(adjustedWidth, adjustedHeight);
        hole.actualRadius = hole.radius * scalingFactor;
    });
}
export function initializeGame() {
    // Canvas initialisieren
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");

    // CSS-Variablen setzen
    document.documentElement.style.setProperty('--arrow-button-margin', config.arrowButtonMargin);

    // Canvas-Größe einstellen
    resizeCanvas();

    // UI initialisieren
    initializeUI();

    // Lochdaten laden
    loadHoleData();

    // Spielvariablen initialisieren
    resetGame();
    resetTimer();

    // Eingabe-Handler einrichten
    setupInputHandlers();

    // Fenstergrößenänderung behandeln
    window.addEventListener('resize', function() {
        resetGame();
    });

    // Spielschleife starten
    draw();
}

function resizeCanvas() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const headerHeight = viewportHeight * (parseFloat(config.headerHeight) / 100);

    const availableHeight = viewportHeight - headerHeight;

    const canvasHeight = availableHeight * config.canvasHeightPercentage;
    const canvasWidth = viewportWidth * 0.95; // 95% der verfügbaren Breite

    // Device Pixel Ratio
    const dpr = window.devicePixelRatio || 1;

    // Canvas-Größe in Pixeln setzen
    gameState.canvas.width = canvasWidth * dpr;
    gameState.canvas.height = canvasHeight * dpr;

    // CSS-Größe des Canvas setzen
    gameState.canvas.style.width = `${canvasWidth}px`;
    gameState.canvas.style.height = `${canvasHeight}px`;

    // Kontext skalieren
    gameState.ctx.setTransform(1, 0, 0, 1, 0, 0);
    gameState.ctx.scale(dpr, dpr);
}

function loadHoleData() {
    gameState.holes = holesData.map(hole => ({
        x: hole.X,
        y: hole.Y,
        radius: hole.Radius,
        Type: hole.Type
    }));
}
