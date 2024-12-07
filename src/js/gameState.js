// src/js/gameState.js

/**
 * gameState.js
 * Verwalten des Spielzustands und der Initialisierung.
 */

import { config } from './config.js';
import { holesData } from '../data/holesData.js';
import { holesDataOriginal } from '../data/holesData_original.js';
import { setupInputHandlers } from './input.js';
import { draw } from './render.js';
import { initializeUI, updateDisplay } from './ui.js';
import { moveHoles, stopHoleMovement } from './holeMovement.js';
import { setCSSVariables } from './utils.js';

export const gameState = {
    canvas: null, // Referenz auf das Canvas-Element
    ctx: null,    // 2D-Kontext des Canvas
    holes: [],    // Array der Löcher
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
        leftYSpeed: 0,   // Geschwindigkeit der linken Seite
        rightYSpeed: 0   // Geschwindigkeit der rechten Seite
    },
    startTime: null,       // Startzeit des Spiels
    elapsedTime: 0,        // Verstrichene Zeit in ms
    timeLastHole: 0,       // Zeit zu der der letzte Punkt gescored wurde in ms
    times: {
        time_0: -1,
        time_1: -1,
        time_2: -1,
        time_3: -1,
        time_4: -1,
        time_5: -1,
        time_6: -1,
        time_7: -1,
        time_8: -1,
        time_9: -1,
        time_10: -1,
    },
    timerInterval: null,   // Interval-ID für den Timer
    gameEndTimeout: null,  // Timeout-ID für das automatische Beenden des Spiels
    lives: config.maxLives, // Aktuelle Leben
    currentTarget: 1,      // Aktuelles Ziel-Loch
    gameOver: false,       // Spielstatus
    ballInHole: false,     // Status der Kugel
    mode: null,            // 'beginner', 'advanced' oder 'expert'
    viewMode: 'beginner',    // Modus für Highscore-Anzeige
    animationFrameId: null, // ID des requestAnimationFrame
};

/**
 * Funktion zum Zurücksetzen des Spiels.
 */
export function resetGame() {
    gameState.gameOver = false;
    gameState.ballInHole = false;
    document.body.classList.remove('showing-end-screen');

    // Canvas-Größe aktualisieren
    resizeCanvas();

    // Stange und Kugel initialisieren
    initializeBarAndBall();

    // Lochdaten laden
    loadHoleData();

    // Löcher skalieren und Position anpassen
    scaleAndPositionHoles();

    // Anzeige aktualisieren
    updateDisplay();

    // Lochbewegung initialisieren
    if (gameState.mode === 'expert') {
        moveHoles(); // Startet die Lochbewegung
    } else{
        stopHoleMovement(); // Beende die Lochbewegung
    }

    // Reset ball speed to prevent carry-over speeds
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;
}

/**
 * Funktion zum Zurücksetzen des Timers.
 */
export function resetTimer() {
    // Timer zurücksetzen
    clearInterval(gameState.timerInterval);
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;
    gameState.timerInterval = setInterval(function () {
        // Verstrichene Zeit in Millisekunden aktualisieren
        gameState.elapsedTime = Date.now() - gameState.startTime;

        // Anzeige aktualisieren (falls nötig, in Sekunden umwandeln)
        updateDisplay();
    }, config.timerUpdateInterval);

    // Timeout für das automatische Beenden des Spiels nach 60 Minuten
    gameState.gameEndTimeout = setTimeout(function () {
        Swal.fire({
            title: 'Spielzeit abgelaufen!',
            text: 'Du hast die maximale Spielzeit von 60 Minuten erreicht.',
            icon: 'info',
            confirmButtonText: 'Zurück zum Start',
            background: '#2c2c2c',
            color: '#ffffff',
        }).then(() => {
            returnToModeSelectionScreen();
        });
    }, config.maxGameDuration);
}

/**
 * Funktion, um zum Startbildschirm zurückzukehren.
 */
function returnToModeSelectionScreen() {
    // Sichtbarkeit der verschiedenen Abschnitte anpassen
    document.getElementById('modeSelectionScreen').style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.game-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.game-info').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';

    // Spielvariablen zurücksetzen
    gameState.gameOver = true;
    resetGame();
    clearInterval(gameState.timerInterval); // Timer beenden
    clearTimeout(gameState.gameEndTimeout);          // Timeout löschen, falls gesetzt
}

/**
 * Funktion zur Initialisierung von Stange und Kugel.
 */
function initializeBarAndBall() {
    // Stange initialisieren
    const barStartY = config.canvasHeightInLogicalPixels * config.barStartYPercentage;
    gameState.bar.leftY = barStartY;
    gameState.bar.rightY = barStartY;
    gameState.bar.leftYSpeed = 0;  // Initialisieren
    gameState.bar.rightYSpeed = 0; // Initialisieren
    gameState.bar.height = config.barHeight;
    gameState.bar.color = config.barColor;

    // Kugel initialisieren
    gameState.ball.radius = config.ballRadius;
    gameState.ball.color = config.ballColor;
    gameState.ball.x = config.canvasWidthInLogicalPixels * config.ballStartXFraction;
    gameState.ball.y = gameState.bar.leftY - gameState.ball.radius - gameState.bar.height / 2;
    gameState.ball.speedX = 0;
    gameState.ball.speedY = 0;

    // Sicherstellen, dass der Ball nicht in einem Loch landet
    ensureBallNotInHole();
}

/**
 * Funktion zur Skalierung und Positionierung der Löcher.
 */
function scaleAndPositionHoles() {
    gameState.holes.forEach(hole => {
        hole.actualX = hole.x * config.canvasWidthInLogicalPixels;
        hole.actualY = hole.y * config.canvasHeightInLogicalPixels;

        const scalingFactor = Math.min(config.canvasWidthInLogicalPixels, config.canvasHeightInLogicalPixels);
        hole.actualRadius = hole.radius * scalingFactor;
    });
}

/**
 * Funktion zur Initialisierung des Spiels.
 */
export function initializeGame() {
    // Canvas initialisieren
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");

    // CSS-Variablen setzen
    setCSSVariables();

    // Canvas-Größe einstellen
    resizeCanvas();

    // UI initialisieren
    initializeUI();

    // Spielvariablen initialisieren
    resetGame();

    // Timer zurücksetzen
    resetTimer();

    // Eingabe-Handler einrichten
    setupInputHandlers();

    // Fenstergrößenänderung behandeln
    window.addEventListener('resize', function() {
        resetGame();
    });

    // Spielschleife starten, falls nicht bereits gestartet
    if (gameState.animationFrameId === null) {
        gameState.animationFrameId = requestAnimationFrame(function (timestamp) {
            gameState.lastTimestamp = timestamp; // Initialen Zeitstempel speichern
            draw(timestamp); // Zeichnen starten
        });
    }
}

/**
 * Funktion zum Anpassen der Canvas-Größe.
 */
function resizeCanvas() {
    const viewportWidth = window.innerWidth; // Höhe des Fensters in logischen Pixeln. Fenster = Bereich des Bildschirms, der von der Webseite sicherbar im Browser angezeigt wird.
    const viewportHeight = window.innerHeight; // Breite des Fensters in logischen Pixeln
    const headerHeight = viewportHeight * (parseFloat(config.headerHeight) / 100);

    const availableHeight = viewportHeight - headerHeight;

    const canvasWidthInLogicalPixels = viewportWidth * 0.95; // Die Breite, die für das Spielfeld vorgesehen ist (in logischen Pixeln).
    const canvasHeightInLogicalPixels = availableHeight * config.canvasHeightPercentage; // Die Höhe, die für das Spielfeld vorgesehen ist (in logischen Pixeln).

    // Device Pixel Ratio
    const dpr = window.devicePixelRatio || 1; // Verhältnis aus logischen und physischen Pixeln

    // Canvas-Größe in Pixeln setzen
    gameState.canvas.width = canvasWidthInLogicalPixels * dpr; // Die Breite des Spielfelds in physischen Pixeln.
    gameState.canvas.height = canvasHeightInLogicalPixels * dpr; // Die Höhe des Spielfelds in physischen Pixeln.

    // CSS-Größe des Canvas setzen
    gameState.canvas.style.width = `${canvasWidthInLogicalPixels}px`;
    gameState.canvas.style.height = `${canvasHeightInLogicalPixels}px`;

    // Kontext skalieren
    gameState.ctx.setTransform(1, 0, 0, 1, 0, 0);
    gameState.ctx.scale(dpr, dpr);

    // Breiten und Höhen in `config` speichern
    config.canvasWidthInLogicalPixels = canvasWidthInLogicalPixels; // Logische Breite
    config.canvasHeightInLogicalPixels = canvasHeightInLogicalPixels; // Logische Höhe

    config.canvasWidthInPhysicalPixels = gameState.canvas.width; // Physische Breite
    config.canvasHeightInPhysicalPixels = gameState.canvas.height; // Physische Höhe

    // Dynamische Skalierung berechnen
    config.metersToLogicalPixels = config.canvasWidthInLogicalPixels / config.realGameWidthInMeters; // Logische Pixel pro Meter
    config.logicalPixelsToMeters = config.realGameWidthInMeters / config.canvasWidthInLogicalPixels; // Meter pro logische Pixel
    config.metersToPhysicalPixels = config.canvasWidthInPhysicalPixels / config.realGameWidthInMeters; // Physische Pixel pro Meter
    config.physicalPixelsToMeters = config.realGameWidthInMeters / config.canvasWidthInPhysicalPixels; // Meter pro physische Pixel
}

/**
 * Funktion zum Laden der Lochdaten.
 */
function loadHoleData() {
    if (gameState.mode == 'beginner') {
        gameState.holes = holesDataOriginal.map(hole => ({
            x: hole.X,
            y: hole.Y,
            radius: hole.Radius,
            Type: hole.Type
        }))
    } else {
        gameState.holes = holesData.map(hole => ({
            x: hole.X,
            y: hole.Y,
            radius: hole.Radius,
            Type: hole.Type
        }))
    }
}

/**
 * Funktion zur Sicherstellung, dass der Ball nicht in einem Loch platziert ist.
 */
function ensureBallNotInHole() {
    const ballX = gameState.ball.x;
    const ballY = gameState.ball.y;
    const ballRadius = gameState.ball.radius;

    for (let hole of gameState.holes) {
        const dx = ballX - hole.actualX;
        const dy = ballY - hole.actualY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= ballRadius + hole.actualRadius * config.holeOverlapThreshold) {
            // Ball befindet sich in einem Loch, verschiebe ihn leicht nach oben
            gameState.ball.y -= (ballRadius + hole.actualRadius * config.holeOverlapThreshold + 10);
            // Optional: Setze die Geschwindigkeit zurück
            gameState.ball.speedX = 0;
            gameState.ball.speedY = 0;
            // Log zur Überprüfung
            console.log('Ball position adjusted to prevent immediate collision.');
        }
    }
}


