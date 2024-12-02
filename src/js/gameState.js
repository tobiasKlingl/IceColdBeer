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
 * Setzt die Position des Balls und der Stangen zurück, stoppt Bewegung und startet den Timer neu.
 */
export function resetGame() {
    gameState.lives = config.maxLives;
    gameState.currentTarget = 1;
    gameState.gameOver = false;

    // Ball-Position und -Geschwindigkeit zurücksetzen
    gameState.ball.x = gameState.canvas.width - config.ballStartOffsetX; // Startposition der Kugel vom rechten Rand
    gameState.ball.y = gameState.canvas.height - config.ballStartOffsetY; // Startposition der Kugel vom unteren Rand
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
    gameState.ball.radius = config.ballRadius;
    gameState.ball.color = config.ballColor;

    // Stangenposition und -eigenschaften zurücksetzen
    gameState.bar.leftY = gameState.canvas.height - config.barStartOffsetY; // Startposition der linken Stange
    gameState.bar.rightY = gameState.canvas.height - config.barStartOffsetY; // Startposition der rechten Stange
    gameState.bar.height = config.barHeight;
    gameState.bar.color = config.barColor;

    // Löcher neu berechnen basierend auf der aktuellen Canvas-Größe
    gameState.holes.forEach(hole => {
        hole.actualX = hole.x * gameState.canvas.width;
        hole.actualY = hole.y * gameState.canvas.height;
        hole.actualRadius = hole.radius * gameState.canvas.width * 1.0; // Skalierung basierend auf der Canvas-Breite
    });

    // Timer starten, falls es das erste Level ist und volle Leben vorhanden sind
    if (gameState.currentTarget === 1 && gameState.lives === config.maxLives) {
        gameState.startTime = Date.now();
        gameState.elapsedTime = 0;
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = setInterval(function() {
            gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
            updateDisplay();
        }, 1000);
    }

    // Anzeige aktualisieren
    updateDisplay();
}

/**
 * Funktion zur Initialisierung des Spiels.
 * Setzt Canvas, UI und Spielvariablen auf.
 */
export function initializeGame() {
    // Canvas und Kontext initialisieren
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");

    // Canvas-Größe einstellen
    resizeCanvas();

    // UI-Elemente initialisieren
    initializeUI();

    // Spielvariablen initialisieren
    resetGame();

    // Lochdaten laden
    loadHoleData();

    // Eingabe-Handler einrichten
    setupInputHandlers();

    // Fenstergrößenänderung behandeln
    window.addEventListener('resize', function() {
        resizeCanvas();
        resetGame();
    });

}

/**
 * Funktion zur Anpassung der Canvas-Größe basierend auf dem Container.
 */
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const width = container.clientWidth * config.canvasWidthPercentage;
    const height = container.clientHeight * config.canvasHeightPercentage;
    gameState.canvas.width = width;
    gameState.canvas.height = height;
    gameState.canvas.style.width = width + 'px';
    gameState.canvas.style.height = height + 'px';
}

/**
 * Funktion zum Laden der Lochdaten und Start des Spiels.
 */
function loadHoleData() {
    gameState.holes = holesData.map(hole => ({
        x: hole.X,
        y: hole.Y,
        radius: hole.Radius,
        Type: hole.Type
    }));
    resetGame();
    // Spielschleife starten
    draw();
}
