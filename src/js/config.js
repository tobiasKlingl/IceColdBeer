// src/js/config.js

/**
 * config.js
 * Enthält alle konfigurierbaren Parameter des Spiels.
 */

export const logicalWidth = window.screen.width;
const devicePixelRatio = window.devicePixelRatio;
const inchToMeter = 0.0254;

// Dynamische Berechnung der physischen Breite des Displays
export function estimateDisplayWidthInMeters() {
    const cssPPI = 96; // CSS-Dichte (Standard in Browsern)
    const estimatedPPI = devicePixelRatio * cssPPI; // Geschätzte physische PPI
    const screenWidthInMeters = logicalWidth / estimatedPPI * inchToMeter; // Breite in Metern berechnen
    return screenWidthInMeters;
}


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
    ballRadius: 6, // Radius der Kugel
    ballStartXFraction: 0.9, // Startposition relativ zur Breite
    ballColor: '#505050', //'#444444',

    // Stangen-Eigenschaften
    barHeight: 5, // Höhe der Stange
    barColor: 'rgba(255, 165, 0, 0.8)',
    baseBarSpeed: 5, // Grundgeschwindigkeit der Stange
    barSpeedDampingFactor: 1.0, // Controls the deceleration rate (0 < dampingFactor < 1)
    barStartYPercentage: 0.95, // Startposition der Stange (relativ zur Höhe)

    // Physikparameter
    gravity: 9.81, // Erdbeschleunigung in m/s²
    airDensity: 1.225, // Dichte der Luft (kg/m³)
    dragCoefficient: 0.47, // Luftwiderstandsbeiwert für eine Kugel
    ballMass: 0.1, // Masse des Balls (kg)

    // Reibung
    staticFrictionCoefficient: 0.02, // Nicht direkt Haftreibung weil kein Gleitvorgang, sondern Haftung gegen den Beginn zu Rollen
    kineticFrictionCoefficient: 0.005, // Rollreibungskoeffizient (typisch: 0.001-0.01)
    wallBounceDamping: 0.7, // Energieverlust bei Kollision mit Wänden

    // Loch-Einstellungen
    holeOverlapThresholdMiss: 0.99, // Schwellenwert für Miss-Löcher
    holeOverlapThresholdTarget: 0.95, // Schwellenwert für Ziel-Löcher
    holeBorderWidth: 3, // Breite des Lochrandes

    // Farben
    colors: {
        currentTargetHoleColor: 'rgba(186, 85, 211, 0.8)', /* Kräftiges Lila für das aktuelle Ziel */
        otherTargetHoleColor: 'rgba(0, 255, 0, 0.8)', // Grün für andere Ziele
        missHoleColor: 'rgba(255, 0, 0, 0.8)', // Rot für Verlustlöcher
        holeBorderColor: 'rgba(255, 255, 255, 1)', // Weißer Rand für Löcher
        playfieldBorderColor: 'rgba(139, 69, 19, 0.8)', // Braun für Spielfeldrand
        buttonColor: 'rgba(0, 128, 255, 0.8)', // Blau für Buttons
        buttonHoverColor: 'rgba(0, 102, 204, 0.8)', // Dunkleres Blau für Hover-Effekt
        headerBackgroundColor: 'rgba(255, 215, 0, 0.8)', // Goldgelb für Header
    },
    playfieldBorderWidth: '5px', // Breite des Spielfeldrandes

    // Schriftart-Einstellungen
    fontSizePercentage: 0.03, // Schriftgröße relativ zur Höhe
    fontFamily: 'Arial', // Schriftart
    fontColor: '#000000', // Schriftfarbe

    // Lebenssystem
    maxLives: 3, // Maximale Anzahl an Leben

    // Anzeigeeinstellungen
    showNumbersOnMissHoles: false, // Zeige Nummern auf Miss-Löchern

    // Button-Einstellungen
    buttonSize: '10.4vh', // Größe der Buttons
    buttonFontSize: '4.5vh',
    restartButtonSize: '16vh',
    arrowButtonMargin: '5px', // Margin für Buttons

    // Timer-Einstellungen
    timerUpdateInterval: 1000, // Aktualisierungsintervall des Timers in ms

    // Gesamtanzahl der Level
    totalLevels: 10, // Anzahl der Ziel-Löcher

    // Margin unter den Steuerungselementen
    controlsBottomMargin: '2vh', // Abstand unter den Steuerungselementen

    // Delta-Y für Lochverschiebung (Bruchteil der Canvas-Höhe)
    deltaYFraction: 0.06, // Verschiebung der Löcher in der Höhe

    // Joystick-Einstellungen
    joystickSize: '11.75vh', // Größe des Joysticks
    joystickHandleHeight: '40%', // Höhe des Joystick-Griffs
    joystickMaxMovement: 51, // Maximale Bewegung des Joysticks in Pixel
    joystickSensitivity: 10, // Empfindlichkeit des Joysticks
    joystickDeadzone: 0, // Deadzone für minimale Bewegungen

    // Expert Mode Einstellungen
    expertModeHoleMovementRadiusTarget: 7, // Bewegungsspielraum für Ziel-Löcher
    expertModeHoleMovementSpeedTarget: 0.08, // Geschwindigkeit der Ziel-Löcher
    expertModeHoleMovementRadiusMiss: 5, // Bewegungsspielraum für Miss-Löcher
    expertModeHoleMovementSpeedMiss: 0.13, // Geschwindigkeit der Miss-Löcher
    expertModeHoleDirectionChangeInterval: 1500, // Intervall für Richtungsänderung in Millisekunden
    expertModeHoleDirectionAngleRange: 20, // Winkelbereich für Richtungsänderung in Grad

    // Spielmodi
    gameModeKeys: ['beginner', 'advanced', 'expert'], // Schlüssel für Spielmodi
    gameModes: {
        'beginner': { 
            title: 'Beginner',
            highscoreSheetName: 'highscores_beginner',
            emoji: '🐣' // Symbol für Anfänger
        }, 
        'advanced': { 
            title: 'Fortgeschritten',
            highscoreSheetName: 'highscores_advanced',
            emoji: '🚀' // Symbol für Fortgeschrittene
        }, 
        'expert': { 
            title: 'Experte',
            highscoreSheetName: 'highscores_expert',
            emoji: '💀' // Symbol für Experten
        },
    },

    // Platzhalter für dynamische Werte
    canvasWidthInMeters: null, // Physische Breite des Canvas (später gesetzt)
    metersToPixels: null,      // Pixel pro Meter (später gesetzt)
    pixelsToMeters: null,      // Meter pro Pixel (später gesetzt)
};