// src/js/config.js

/**
 * config.js
 * Contains all configurable parameters of the game.
 */

export const config = {
    // Canvas Settings
    canvasMarginPercentage: 0.025,    // 2.5% margin around the canvas
    canvasHeightPercentage: 0.65,     // 65% of the available viewport height

    // Header Settings
    headerHeight: '8vh',              // 8% of the viewport height
    headerBackgroundOpacity: 0.8,     // Transparency of the header (0.0 - 1.0)

    // Element Transparency Settings
    elementBackgroundOpacity: 0.7,    // General transparency for UI elements (0.0 - 1.0)

    // Ball Properties
    ballRadius: 10,
    ballColor: "#cccccc",
    ballStartOffsetX: 50,
    ballStartOffsetYPercentage: 0.90,

    // Bar Properties
    barHeight: 4,
    barColor: "#00bcd4",
    baseBarSpeed: 2,
    barStartYPercentage: 0.95,

    // Game Parameters
    gravity: 0.5,
    friction: 0.95,

    // Hole Settings
    holeOverlapThreshold: 1.0,
    currentTargetHoleColor: "#FFD700",
    otherTargetHoleColor: "#90EE90",
    missHoleColor: "#000000",
    holeNumberColor: "#000000",
    totalLevels: 10,

    // Font Settings
    fontSizePercentage: 0.03,
    fontFamily: 'Arial',
    fontColor: '#000000',

    // Life System
    maxLives: 3,

    // Display Settings
    showNumbersOnMissHoles: false,

    // Button Settings
    buttonSize: '13.5vh',             // 10% smaller than before
    buttonFontSize: '4.5vh',
    restartButtonSize: '16vh',        // Increased size for the restart button

    // Timer Settings
    timerUpdateInterval: 1000
};
