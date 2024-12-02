// src/js/gameState.js

/**
 * gameState.js
 * Verwalten des Spielzustands und der Initialisierung.
 */

import { config } from './config.js';
import { holesData } from '../data/holesData.js';
import { setupInputHandlers } from './input.js';
import { draw } from './render.js';
import { resetGame } from './gameLogic.js';
import { initializeUI, updateDisplay } from './ui.js';

/**
 * Globale Variablen, die den Zustand des Spiels repräsentieren.
 */
export let canvas;
export let ctx;
export let gameOver = false;
export let lives;
export let currentTarget;
export let holes = [];
export let ball = {
    x: 0,
    y: 0,
    speedX: 0,
    speedY: 0,
    radius: 0,
    color: ''
};
export let bar = {
    leftY: 0,
    rightY: 0,
    height: 0,
    color: ''
};
export let startTime;
export let elapsedTime = 0;
export let timerInterval;

/**
 * Funktion zur Initialisierung des Spiels.
 * Setzt Canvas, UI und Spielvariablen auf.
 */
export function initializeGame() {
    // Canvas und Kontext initialisieren
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // Canvas-Größe einstellen
    resizeCanvas();

    // UI-Elemente initialisieren
    initializeUI();

    // Spielvariablen initialisieren
    lives = config.maxLives;
    currentTarget = 1;

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
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

/**
 * Funktion zum Laden der Lochdaten und Start des Spiels.
 */
function loadHoleData() {
    holes = holesData.map(hole => ({
        x: hole.X,
        y: hole.Y,
        radius: hole.Radius,
        Type: hole.Type
    }));
    resetGame();
    // Spielschleife starten
    draw();
}
