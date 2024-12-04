// src/js/config.js

/**
 * config.js
 * Enthält alle konfigurierbaren Parameter des Spiels.
 */

export const config = {
    // Prozentsatz der Höhe, den das Canvas einnimmt
    canvasHeightPercentage: 0.6,

    // Header-Einstellungen
    headerHeight: '6vh',
    headerBackgroundOpacity: 0.8,

    // Abstände für das Spielfeld
    playfieldTopMargin: '1vh',
    playfieldBottomMargin: '1vh',

    // Transparenzeinstellungen für Elemente
    elementBackgroundOpacity: 0.7,

    // Ball-Eigenschaften
    ballRadius: 7,
    ballColor: '#444444',

    // Stangen-Eigenschaften
    barHeight: 5,
    barColor: 'rgba(255, 165, 0, 0.8)',
    baseBarSpeed: 0.1,

    barStartYPercentage: 0.95,

    // Physikparameter
    gravity: 0.5,
    friction: 0.99,
    staticFrictionThreshold: 0.0,

    // Dämpfung bei Kollision mit Wänden
    wallBounceDamping: 0.66, // Zwischen 0 und 1

    // Loch-Einstellungen
    holeOverlapThreshold: 0.85,
    holeBorderWidth: 2,
    colors: {
        currentTargetHoleColor: 'rgba(255, 255, 0, 0.8)',
        otherTargetHoleColor: 'rgba(0, 255, 0, 0.8)',
        missHoleColor: 'rgba(255, 0, 0, 0.8)',
        holeBorderColor: 'rgba(255, 255, 255, 1)',
        playfieldBorderColor: 'rgba(139, 69, 19, 0.8)',
        buttonColor: 'rgba(0, 128, 255, 0.8)',
        buttonHoverColor: 'rgba(0, 102, 204, 0.8)',
        headerBackgroundColor: 'rgba(255, 215, 0, 0.8)',
    },
    playfieldBorderWidth: '5px',

    // Schriftart-Einstellungen
    fontSizePercentage: 0.03,
    fontFamily: 'Arial',
    fontColor: '#000000',

    // Lebenssystem
    maxLives: 3,

    // Anzeigeeinstellungen
    showNumbersOnMissHoles: false,

    // Button-Einstellungen
    buttonSize: '10.4vh', // Größe der Buttons
    buttonFontSize: '4.5vh',
    restartButtonSize: '16vh',
    arrowButtonMargin: '5px', // Margin für Buttons

    // Timer-Einstellungen
    timerUpdateInterval: 1000,

    // Gesamtanzahl der Level
    totalLevels: 10,

    // Margin unter den Steuerungselementen
    controlsBottomMargin: '2vh',

    // Delta-Y für Lochverschiebung (Bruchteil der Canvas-Höhe)
    deltaYFraction: 0.06,

    // Joystick-Einstellungen
    joystickSize: '11.5vh',
    joystickHandleHeight: '40%',
    joystickMaxMovement: 51,
    joystickSensitivity: 3,
    joystickDeadzone: 4,

    // Expert Mode Einstellungen
    expertModeHoleMovementRadiusTarget: 10,
    expertModeHoleMovementSpeedTarget: 0.3,
    expertModeHoleMovementRadiusMiss: 5,
    expertModeHoleMovementSpeedMiss: 0.15,
    expertModeHoleDirectionChangeInterval: 1000, // Intervall für Richtungsänderung in Millisekunden
    expertModeHoleDirectionAngleRange: 20,      // Winkelbereich für Richtungsänderung in Grad

    // Highscore Tabellen
    highscoreSheetNames: {
        normal: 'normal',
        expert: 'expert'
    },
};
